import http from "node:http";
import https from "node:https";

// The SensorMonitor API has no CORS policy, so the browser calls this same-origin
// route (/proxy/*) and it forwards the request to the API from the server.
export const dynamic = "force-dynamic";

const API_URL = (process.env.SENSOR_API_URL ?? "https://localhost:5001").replace(/\/$/, "");
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

async function forward(req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;
  const target = new URL(`${API_URL}/${path.join("/")}${new URL(req.url).search}`);
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.from(await req.arrayBuffer());

  const isHttps = target.protocol === "https:";
  // In development, accept the self-signed ASP.NET Core dev certificate on localhost.
  // Never applied in production builds or to non-local hosts.
  const allowSelfSigned = process.env.NODE_ENV !== "production" && LOCAL_HOSTS.includes(target.hostname);

  const headers: Record<string, string> = { accept: "application/json" };
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  if (body) headers["content-length"] = String(body.length);

  return new Promise<Response>((resolve) => {
    const upstream = (isHttps ? https : http).request(
      target,
      { method: req.method, headers, ...(isHttps ? { rejectUnauthorized: !allowSelfSigned } : {}) },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const status = res.statusCode ?? 502;
          const noBody = status === 204 || status === 304;
          resolve(
            new Response(noBody ? null : new Uint8Array(Buffer.concat(chunks)), {
              status,
              headers: { "content-type": res.headers["content-type"] ?? "application/json" },
            }),
          );
        });
      },
    );
    upstream.on("error", (e) =>
      resolve(Response.json({ error: `Can't reach the API at ${API_URL}: ${e.message}` }, { status: 502 })),
    );
    if (body) upstream.write(body);
    upstream.end();
  });
}

export { forward as GET, forward as POST };

// Shapes returned by the SensorMonitor API (ASP.NET Core serialises as camelCase).

export type SensorType = "Battery" | "Generator" | "Rectifier";

export interface SensorTelemetry {
  id: string;
  gatewayId: string;
  sensorType: string;
  sensorId: string;
  timestamp: string;
}

export interface Battery {
  id: string;
  voltage: number;
  model: string;
  description?: string | null;
  current: number;
  stateOfCharge: number;
  capacity: number;
}

export interface Generator {
  id: string;
  voltage: number;
  model: string;
  description?: string | null;
  status: string;
  fuelLevel: number;
  tankSize: number;
}

export interface Rectifier {
  id: string;
  voltage: number;
  model: string;
  description?: string | null;
  current: number;
  lowVoltageDisconnect: number;
  gridActive: boolean;
}

export interface Snapshot {
  telemetry: SensorTelemetry[];
  batteries: Battery[];
  generators: Generator[];
  rectifiers: Rectifier[];
}

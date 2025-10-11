export type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "action"
  | "cancel"
  | "menu"
  | "debug";

export type AssetsManifest = {
  images?: Record<string, string>;
  json?: Record<string, string>;
  audio?: Record<string, string>;
};

export type MapSpec = {
  width: number;
  height: number;
  tileSize: number;
  columns: number;
};

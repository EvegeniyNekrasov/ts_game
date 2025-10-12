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

export type FacingDirection = "down" | "up" | "left" | "right";

export type MapJSON = {
  tileSize: number;
  columns: number;
  width: number;
  height: number;
  groundRows: string[];
  collisionRows: string[];
  entities: {
    type: "npc";
    x: number;
    y: number;
    sprite: string;
    facing: FacingDirection;
    dialog: string[];
  }[];
  playerStart: { x: number; y: number };
  triggers?: Trigger[];
};

export type TriggerDoor = {
  type: "door";
  x: number;
  y: number;
  toGroundId: number;
  openText: string[];
  opened?: boolean;
};
export type TriggerChest = {
  type: "chest";
  x: number;
  y: number;
  item: string;
  openText: string[];
  opened?: boolean;
};
export type Trigger = TriggerDoor | TriggerChest;

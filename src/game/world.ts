import { Tilemap } from "../gfx/tilemap.js";
import { type SpriteSheet } from "../gfx/sprites.js";
import { NPC } from "./npc.js";
import { type MapJSON } from "../types/index.js";
import { TriggerController } from "../game/triggers.js";

export function buildWorld(
  map: MapJSON,
  tilesImage: HTMLImageElement,
  npcSheets: Record<string, SpriteSheet>,
) {
  const spec = {
    width: map.width,
    height: map.height,
    tileSize: map.tileSize,
    columns: map.columns,
  };
  const tilemap = new Tilemap(spec, tilesImage);
  const ground = expandRowsNumeric(map.groundRows);
  const solid = map.collisionRows
    ? expandRowsBinary(map.collisionRows)
    : ground.map((v) => (v === 1 ? 1 : 0));
  tilemap.setGroundFromArray(ground);
  tilemap.setCollisionFromArray(solid);
  const npcs: NPC[] = [];
  for (const e of map.entities) {
    const sheet = npcSheets[e.sprite] || null;
    npcs.push(new NPC(e.x, e.y, map.tileSize, sheet, null, e.facing, e.dialog));
  }
  const triggerCtrl = new TriggerController();

  for (const t of map.triggers || []) {
    triggerCtrl.add(t);
  }
  const playerStart = { x: map.playerStart.x, y: map.playerStart.y };
  return { tilemap, npcs, playerStart, triggers: triggerCtrl };
}

function expandRowsNumeric(rows: string[]): number[] {
  const out: number[] = [];
  for (const r of rows)
    for (let i = 0; i < r.length; i++) out.push(r.charCodeAt(i) - 48);
  return out;
}

function expandRowsBinary(rows: string[]): number[] {
  const out: number[] = [];
  for (const r of rows)
    for (let i = 0; i < r.length; i++) out.push(r[i] === "1" ? 1 : 0);
  return out;
}

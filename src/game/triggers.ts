import { type DialogUI } from "../ui/dialog/box.js";
import { type Tilemap } from "../gfx/tilemap.js";
import { type PlayerCharacter } from "./player.js";
import { GameState } from "../state/game.js";
import { type Trigger, type FacingDirection } from "../types/index.js";
import { TileId } from "../utils/enums.js";

export class TriggerController {
  triggers: Trigger[];

  constructor() {
    this.triggers = [];
  }

  public add(t: Trigger): void {
    this.triggers.push(t);
  }

  public facingCell(px: number, py: number, facing: FacingDirection) {
    if (facing === "down") return { x: px, y: py + 1 };
    if (facing === "up") return { x: px, y: py - 1 };
    if (facing === "left") return { x: px - 1, y: py };
    return { x: px + 1, y: py };
  }

  public tryUse(
    player: PlayerCharacter,
    actionPressed: boolean,
    tilemap: Tilemap,
    dialogue: DialogUI,
    ctx: CanvasRenderingContext2D,
    viewportW: number,
    viewportH: number,
  ) {
    if (!actionPressed || dialogue.active) return;
    const f = this.facingCell(player.tileX, player.tileY, player.facing);

    for (const t of this.triggers) {
      if (t.x === f.x && t.y === f.y) {
        switch (t.type) {
          case "door": {
            if (t.opened) return;

            if (t.requiresItem && !GameState.instance.hasItem(t.requiresItem)) {
              const deny =
                t.denyText && t.denyText.length
                  ? t.denyText
                  : ["Necesitas una llave"];
              dialogue.open(ctx, deny, viewportW, viewportH);
              return;
            }

            if (t.requiresItem && t.consumeItem) {
              if (
                !GameState.instance.consumeItem(t.requiresItem, TileId.WALL)
              ) {
                const deny =
                  t.denyText && t.denyText.length
                    ? t.denyText
                    : ["No puedes abrirla"];
                dialogue.open(ctx, deny, viewportW, viewportH);
                return;
              }
            }
            tilemap.setCollisionAt(t.x, t.y, false);
            tilemap.setGroundAt(t.x, t.y, t.toGroundId);
            t.opened = true;
            dialogue.open(ctx, t.openText, viewportW, viewportH);
            return;
          }

          case "chest": {
            if (t.opened) {
              dialogue.open(ctx, ["Está vacío."], viewportW, viewportH);
              return;
            }
            t.opened = true;
            GameState.instance.addItem(t.item, TileId.WALL);
            tilemap.setGroundAt(t.x, t.y, TileId.CHEST_OPEN);
            dialogue.open(ctx, t.openText, viewportW, viewportH);
            return;
          }

          default:
            break;
        }
      }
    }
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    tileSize: number,
  ) {
    ctx.save();
    ctx.lineWidth = 1;
    for (const t of this.triggers) {
      const x = t.x * tileSize - cameraX;
      const y = t.y * tileSize - cameraY;
      if (t.type === "door") {
        ctx.strokeStyle = t.opened
          ? "rgba(0,255,128,0.7)"
          : "rgba(255,128,0,0.9)";
        ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
      } else {
        ctx.strokeStyle = t.opened
          ? "rgba(180,180,0,0.7)"
          : "rgba(255,255,0,0.9)";
        ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
        ctx.beginPath();
        ctx.moveTo(x + tileSize / 2, y + 4);
        ctx.lineTo(x + tileSize / 2, y + tileSize - 4);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

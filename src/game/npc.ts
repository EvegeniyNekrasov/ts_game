import { type SpriteSheet } from "../gfx/sprites.js";
import { type FacingDirection } from "../types/index.js";

export class NPC {
  tileX: number;
  tileY: number;
  tileSizePx: number;
  pixelX: number;
  pixelY: number;
  sheet: SpriteSheet | null;
  color: string | null;
  facing: FacingDirection;
  dialog: string[];
  constructor(
    tileX: number,
    tileY: number,
    tileSizePx: number,
    sheet: SpriteSheet | null,
    color: string | null,
    facing: FacingDirection,
    dialog: string[],
  ) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileSizePx = tileSizePx;
    this.pixelX = tileX * tileSizePx;
    this.pixelY = tileY * tileSizePx;
    this.sheet = sheet;
    this.color = color;
    this.facing = facing;
    this.dialog = dialog;
  }

  private readonly rowMap: Record<FacingDirection, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  private row(): number {
    return this.rowMap[this.facing];
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const dx = Math.floor(this.pixelX - cameraX);
    const dy = Math.floor(this.pixelY - cameraY);
    if (this.sheet) {
      const frameIndex = this.row() * 3 + 0;
      this.sheet.drawFrame(ctx, frameIndex, dx, dy);
      return;
    }
    ctx.fillStyle = this.color || "#66c2ff";
    ctx.fillRect(dx, dy, this.tileSizePx, this.tileSizePx);
  }
}

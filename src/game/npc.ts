export class NPC {
  tileX: number;
  tileY: number;
  tileSizePx: number;
  pixelX: number;
  pixelY: number;
  color: string;
  dialog: string[];

  constructor(
    tileX: number,
    tileY: number,
    tileSizePx: number,
    color: string,
    dialog: string[],
  ) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileSizePx = tileSizePx;
    this.pixelX = tileX * tileSizePx;
    this.pixelY = tileY * tileSizePx;
    this.color = color;
    this.dialog = dialog;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      Math.floor(this.pixelX - cameraX),
      Math.floor(this.pixelY - cameraY),
      this.tileSizePx,
      this.tileSizePx,
    );
  }
}

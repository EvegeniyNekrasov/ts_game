import { type Tilemap } from "../gfx/tilemap.js";
import { type Input } from "../io/input.js";

export class PlayerCharacter {
  tileMap: Tilemap;
  tileX: number;
  tileY: number;
  pixelX: number;
  pixelY: number;
  targetPixelX: number;
  targetPixelY: number;
  isStepping: boolean;
  tilesPerSecond: number;
  tileSizePx: number;

  constructor(
    tileMap: Tilemap,
    startTileX: number,
    startTileY: number,
    tilesPerSecond = 6,
  ) {
    this.tileMap = tileMap;
    this.tileX = startTileX;
    this.tileY = startTileY;
    this.tileSizePx = tileMap.tileSize;
    this.pixelX = this.tileX * this.tileSizePx;
    this.pixelY = this.tileY * this.tileSizePx;
    this.targetPixelX = this.pixelX;
    this.targetPixelY = this.pixelY;
    this.isStepping = false;
    this.tilesPerSecond = tilesPerSecond;
  }

  tryQueueStep(dx: number, dy: number) {
    const nextTileX = this.tileX + dx;
    const nextTileY = this.tileY + dy;
    if (this.tileMap.isSolidTile(nextTileX, nextTileY)) return;
    this.tileX = nextTileX;
    this.tileY = nextTileY;
    this.targetPixelX = this.tileX * this.tileSizePx;
    this.targetPixelY = this.tileY * this.tileSizePx;
    this.isStepping = true;
  }

  handleInputActions(input: Input): void {
    if (this.isStepping) return;
    if (input.actionDown("left")) {
      this.tryQueueStep(-1, 0);
      return;
    }
    if (input.actionDown("right")) {
      this.tryQueueStep(1, 0);
      return;
    }
    if (input.actionDown("up")) {
      this.tryQueueStep(0, -1);
      return;
    }
    if (input.actionDown("down")) {
      this.tryQueueStep(0, 1);
      return;
    }
  }

  update(input: Input, dt: number): void {
    this.handleInputActions(input);
    if (!this.isStepping) return;
    const pixelsPerSec = this.tilesPerSecond * this.tileSizePx;
    const dx = this.targetPixelX - this.pixelX;
    const dy = this.targetPixelY - this.pixelY;
    const stepX = Math.sign(dx) * pixelsPerSec * dt;
    const stepY = Math.sign(dy) * pixelsPerSec * dt;
    if (Math.abs(stepX) > Math.abs(dx)) {
      this.pixelX = this.targetPixelX;
    } else {
      this.pixelX += stepX;
    }

    if (Math.abs(stepY) > Math.abs(dy)) {
      this.pixelY = this.targetPixelY;
    } else {
      this.pixelY += stepY;
    }

    if (this.pixelX === this.targetPixelX && this.pixelY === this.targetPixelY)
      this.isStepping = false;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(
      Math.floor(this.pixelX - cameraX),
      Math.floor(this.pixelY - cameraY),
      this.tileSizePx,
      this.tileSizePx,
    );
  }

  centerX(): number {
    return this.pixelX + this.tileSizePx / 2;
  }

  centerY(): number {
    return this.pixelY + this.tileSizePx / 2;
  }
}

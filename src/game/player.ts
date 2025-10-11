import { type Tilemap } from "../gfx/tilemap.js";
import { type Input } from "../io/input.js";
import { type SpriteSheet, SpriteAnimator } from "../gfx/sprites.js";
import { type FacingDirection } from "../types/index.js";

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
  facing: FacingDirection;
  animator: SpriteAnimator;

  constructor(
    tileMap: Tilemap,
    startTileX: number,
    startTileY: number,
    tilesPerSecond: number,
    spriteSheet: SpriteSheet,
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
    this.facing = "down";
    this.animator = new SpriteAnimator(spriteSheet, 2, 8);
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
      this.facing = "left";
      this.tryQueueStep(-1, 0);
      return;
    }
    if (input.actionDown("right")) {
      this.facing = "right";
      this.tryQueueStep(1, 0);
      return;
    }
    if (input.actionDown("up")) {
      this.facing = "up";
      this.tryQueueStep(0, -1);
      return;
    }
    if (input.actionDown("down")) {
      this.facing = "down";
      this.tryQueueStep(0, 1);
      return;
    }
  }

  update(input: Input, dt: number): void {
    this.handleInputActions(input);
    if (this.isStepping) {
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

      if (
        this.pixelX === this.targetPixelX &&
        this.pixelY === this.targetPixelY
      )
        this.isStepping = false;
    }
    const row =
      this.facing === "down"
        ? 0
        : this.facing === "left"
          ? 1
          : this.facing === "right"
            ? 2
            : 3;
    if (this.isStepping) {
      this.animator.play(row);
    } else {
      this.animator.stop();
    }

    this.animator.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const dx = Math.floor(this.pixelX - cameraX);
    const dy = Math.floor(this.pixelY - cameraY);
    this.animator.draw(ctx, dx, dy);
  }

  centerX(): number {
    return this.pixelX + this.tileSizePx / 2;
  }

  centerY(): number {
    return this.pixelY + this.tileSizePx / 2;
  }
}

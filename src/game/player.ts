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
  isBlocked: (tx: number, ty: number) => boolean;
  nextDX: number;
  nextDY: number;

  constructor(
    tileMap: Tilemap,
    startTileX: number,
    startTileY: number,
    tilesPerSecond: number,
    spriteSheet: SpriteSheet,
    isBlocked: (tx: number, ty: number) => boolean,
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
    this.animator = new SpriteAnimator(spriteSheet, 3, 8);
    this.isBlocked = isBlocked;
    this.nextDX = 0;
    this.nextDY = 0;
  }

  private wantDirPressed(input: Input) {
    if (input.actionPressed("up")) return { dx: 0, dy: -1 };
    if (input.actionPressed("down")) return { dx: 0, dy: 1 };
    if (input.actionPressed("left")) return { dx: -1, dy: 0 };
    if (input.actionPressed("right")) return { dx: 1, dy: 0 };
    return { dx: 0, dy: 0 };
  }

  private setFacingFrom(dx: number, dy: number) {
    if (dy > 0) this.facing = "down";
    else if (dy < 0) this.facing = "up";
    else if (dx > 0) this.facing = "right";
    else if (dx < 0) this.facing = "left";
  }

  private tryStartStep(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return false;
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;
    if (this.isBlocked(nx, ny)) return false;
    this.tileX = nx;
    this.tileY = ny;
    this.targetPixelX = this.tileX * this.tileSizePx;
    this.targetPixelY = this.tileY * this.tileSizePx;
    this.isStepping = true;
    return true;
  }

  private planStep(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return false;
    this.setFacingFrom(dx, dy);

    if (dx !== 0 && dy !== 0) {
      if (this.tryStartStep(dx, 0)) return true;
      if (this.tryStartStep(0, dy)) return true;
      return false;
    }

    if (dx !== 0) return this.tryStartStep(dx, 0);
    if (dy !== 0) return this.tryStartStep(0, dy);
    return false;
  }

  private queueOrTurn(dx: number, dy: number) {
    if (this.isStepping) return;
    if (!this.planStep(dx, dy)) this.setFacingFrom(dx, dy);
  }

  private consumeQueue() {
    if (!this.isStepping && (this.nextDX !== 0 || this.nextDY !== 0)) {
      const dx = this.nextDX;
      const dy = this.nextDY;
      this.nextDX = 0;
      this.nextDY = 0;
      if (!this.planStep(dx, dy)) this.setFacingFrom(dx, dy);
    }
  }

  update(input: Input, dt: number) {
    const want = this.wantDirPressed(input);
    if (want.dx !== 0 || want.dy !== 0) this.queueOrTurn(want.dx, want.dy);
    if (this.isStepping) {
      const v = this.tilesPerSecond * this.tileSizePx;
      const dx = this.targetPixelX - this.pixelX;
      const dy = this.targetPixelY - this.pixelY;
      const sx = Math.sign(dx) * v * dt;
      const sy = Math.sign(dy) * v * dt;
      if (Math.abs(sx) >= Math.abs(dx)) this.pixelX = this.targetPixelX;
      else this.pixelX += sx;
      if (Math.abs(sy) >= Math.abs(dy)) this.pixelY = this.targetPixelY;
      else this.pixelY += sy;
      if (
        this.pixelX === this.targetPixelX &&
        this.pixelY === this.targetPixelY
      )
        this.isStepping = false;
    } else {
      this.consumeQueue();
    }
    const movingNow = this.isStepping || want.dx !== 0 || want.dy !== 0;
    const row = this.getRowMap(this.facing);
    if (movingNow) this.animator.play(row);
    else this.animator.stop();
    this.animator.update(dt);
  }

  private facingMap: Record<string, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  private getRowMap(facing: FacingDirection) {
    return this.facingMap[this.facing];
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.animator.draw(
      ctx,
      Math.floor(this.pixelX - cameraX),
      Math.floor(this.pixelY - cameraY),
    );
  }

  centerX() {
    return this.pixelX + this.tileSizePx / 2;
  }
  centerY() {
    return this.pixelY + this.tileSizePx / 2;
  }
}

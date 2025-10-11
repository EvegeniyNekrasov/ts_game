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
    this.animator = new SpriteAnimator(spriteSheet, 2, 8);
    this.isBlocked = isBlocked;
  }

  private getFacing(
    dx: number,
    dy: number,
    current: FacingDirection,
  ): FacingDirection {
    if (dy > 0) return "down";
    if (dy < 0) return "up";
    if (dx > 0) return "right";
    if (dx < 0) return "left";
    return current;
  }

  tryQueueStep(dx: number, dy: number) {
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;
    this.facing = this.getFacing(dx, dy, this.facing);
    if (dx === 0 && dy === 0) return;
    if (this.isBlocked(nx, ny)) return;
    this.tileX = nx;
    this.tileY = ny;
    this.targetPixelX = this.tileX * this.tileSizePx;
    this.targetPixelY = this.tileY * this.tileSizePx;
    this.isStepping = true;
  }
  handleInputActions(input: Input) {
    if (this.isStepping) return;
    const dx =
      (input.actionDown("right") ? 1 : 0) + (input.actionDown("left") ? -1 : 0);
    const dy =
      (input.actionDown("down") ? 1 : 0) + (input.actionDown("up") ? -1 : 0);
    const sx = dx !== 0 ? Math.sign(dx) : 0;
    const sy = dy !== 0 ? Math.sign(dy) : 0;
    if (sx !== 0 || sy !== 0) this.tryQueueStep(sx, sy);
  }
  update(input: Input, dt: number) {
    this.handleInputActions(input);
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
    }
    const movingNow =
      this.isStepping ||
      input.actionDown("left") ||
      input.actionDown("right") ||
      input.actionDown("up") ||
      input.actionDown("down");

    const row = this.getRowNum(this.facing);
    if (movingNow) this.animator.play(row);
    else this.animator.stop();
    this.animator.update(dt);
  }

  private readonly rowMap: Record<FacingDirection, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  private getRowNum(facing: FacingDirection): number {
    return this.rowMap[facing];
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

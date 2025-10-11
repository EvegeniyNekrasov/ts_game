export class Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  worldWidth: number;
  worldHeight: number;

  constructor(w: number, h: number, worldW: number, worldH: number) {
    this.x = 0;
    this.y = 0;
    this.width = w;
    this.height = h;
    this.worldWidth = worldW;
    this.worldHeight = worldH;
  }

  setWorldSize(w: number, h: number): void {
    this.worldWidth = w;
    this.worldHeight = h;
    this.clamp();
  }

  focus(cx: number, cy: number): void {
    this.x = Math.floor(cx - this.width / 2);
    this.y = Math.floor(cy - this.height / 2);
    this.clamp();
  }

  clamp() {
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x + this.width > this.worldWidth)
      this.x = Math.max(0, this.worldWidth - this.width);
    if (this.y + this.height > this.worldHeight)
      this.y = Math.max(0, this.worldHeight - this.height);
  }
}

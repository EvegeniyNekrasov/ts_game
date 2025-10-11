export class DebugOverlay {
  visible: boolean;
  fps: number;
  frames: number;
  t: number;
  scale: number;

  constructor() {
    this.visible = false;
    this.fps = 0;
    this.frames = 0;
    this.t = 0;
    this.scale = 1;
  }

  toggle(): void {
    this.visible = !this.visible;
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  update(dt: number): void {
    this.frames++;
    this.t = dt;
    if (this.t >= 0.25) {
      this.fps = this.frames / this.t;
      this.frames = 0;
      this.t = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.visible) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(4, 4, 120, 48);
    ctx.fillStyle = "#0f0";
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    ctx.fillText(`FPS: ${this.fps.toFixed(1)}`, 8, 8);
    ctx.fillText(`Size: ${width}x${height}`, 8, 20);
    ctx.fillText(`Scale: ${this.scale}`, 8, 32);
  }
}

export class SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  constructor(
    image: HTMLImageElement,
    frameWidth: number,
    frameHeight: number,
    columns: number,
  ) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.columns = columns;
  }
  drawFrame(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    dx: number,
    dy: number,
  ) {
    const sx = (frameIndex % this.columns) * this.frameWidth;
    const sy = Math.floor(frameIndex / this.columns) * this.frameHeight;
    ctx.drawImage(
      this.image,
      sx,
      sy,
      this.frameWidth,
      this.frameHeight,
      dx,
      dy,
      this.frameWidth,
      this.frameHeight,
    );
  }
}

export class SpriteAnimator {
  sheet: SpriteSheet;
  currentRow: number;
  framesPerRow: number;
  frame: number;
  elapsed: number;
  fps: number;
  playing: boolean;
  constructor(sheet: SpriteSheet, framesPerRow: number, fps = 8) {
    this.sheet = sheet;
    this.framesPerRow = framesPerRow;
    this.fps = fps;
    this.currentRow = 0;
    this.frame = 0;
    this.elapsed = 0;
    this.playing = false;
  }
  play(row: number) {
    if (this.currentRow !== row) this.frame = 0;
    this.currentRow = row;
    this.playing = true;
  }
  stop() {
    this.playing = false;
  }
  update(dt: number) {
    if (!this.playing) return;
    this.elapsed += dt;
    const step = 1 / this.fps;
    while (this.elapsed >= step) {
      this.elapsed -= step;
      this.frame = (this.frame + 1) % this.framesPerRow;
    }
  }
  draw(ctx: CanvasRenderingContext2D, dx: number, dy: number) {
    const frameIndex = this.currentRow * this.framesPerRow + this.frame;
    this.sheet.drawFrame(ctx, frameIndex, dx, dy);
  }
}

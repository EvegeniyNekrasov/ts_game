import { TextPrinter } from "./printer.js";

export class DialogUI {
  active: boolean;
  printer: TextPrinter;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  margin: number;

  constructor() {
    this.active = false;
    this.printer = new TextPrinter(45);
    this.boxX = 6;
    this.boxY = 0;
    this.boxW = 0;
    this.boxH = 54;
    this.margin = 10;
  }

  public open(
    ctx: CanvasRenderingContext2D,
    lines: string[],
    viewportW: number,
    viewportH: number,
  ): void {
    this.boxW = viewportW - 12;
    this.boxY = viewportH - this.boxH - 6;
    this.active = true;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "10px monospace";
    this.printer.open(ctx, lines, this.boxW - this.margin * 2, 3);
  }

  public close() {
    this.active = false;
  }

  public update(dt: number) {
    if (!this.active) return;
    this.printer.update(dt);
  }

  public advance() {
    if (!this.active) return;
    if (!this.printer.donePage) {
      this.printer.skipPage();
      return;
    }

    if (this.printer.hasNext()) {
      this.printer.nextPage();
      return;
    }

    this.close();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;

    const x = this.boxX;
    const y = this.boxY;
    const w = this.boxW;
    const h = this.boxH;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(225,225,225,0.25)";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.font = "10px monospace";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "top";

    const lines = this.printer.currentLines();
    let ty = y + this.margin;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + this.margin, ty);
      ty += 12;
    }

    if (
      this.printer.donePage &&
      this.printer.pageIndex < this.printer.pages.length - 1
    ) {
      const ix = x + w - 14;
      const iy = y + h - 12;
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ix + 6, iy);
      ctx.lineTo(ix + 3, iy + 6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

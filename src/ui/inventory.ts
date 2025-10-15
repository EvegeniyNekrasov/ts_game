import { GameState } from "../state/game.js";

export class InventoryUI {
  active: boolean;
  positionX: number;
  positionY: number;
  width: number;
  height: number;

  constructor() {
    this.active = false;
    this.positionX = 0;
    this.positionY = 0;
    this.width = 160;
    this.height = 120;
  }

  public open(viewW: number, viewH: number): void {
    this.width = Math.min(200, Math.max(160, Math.floor(viewW * 0.6)));
    this.height = Math.min(140, Math.max(100, Math.floor(viewH * 0.6)));
    this.positionX = Math.floor((viewW - this.width) / 2);
    this.positionX = Math.floor((viewH - this.height) / 2);
    this.active = true;
  }

  public close(): void {
    this.active = false;
  }

  public update(actionPressed: boolean, cancelPressed: boolean) {
    if (!this.active) return;
    if (actionPressed && cancelPressed) this.close();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(this.positionX, this.positionY, this.width, this.height);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.strokeRect(
      this.positionX + 0.5,
      this.positionY + 0.5,
      this.width - 1,
      this.height - 1,
    );
    ctx.font = "10px monospace";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "top";
    const title = "Inventario";
    ctx.fillText(title, this.positionX + 10, this.positionY + 8);
    let ty = this.positionY + 24;
    const entries = Object.entries(GameState.instance.items).filter(
      ([, n]) => (n ?? 0) > 0,
    );
    if (entries.length === 0) {
      ctx.fillText("Vacío", this.positionX + 10, ty);
    } else {
      for (let i = 0; i < entries.length; i++) {
        const [name, count] = entries[i];
        ctx.fillText(`${name}: ${count}`, this.positionX + 10, ty);
        ty += 12;
      }
    }
    ctx.restore();
  }
}

import { GameState } from "../state/game.js";

export class HUD {
  draw(ctx: CanvasRenderingContext2D) {
    const keys = GameState.instance.items["llave"] ?? 0;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(6, 6, 96, 20);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(6.5, 6.5, 95, 19);
    ctx.font = "10px monospace";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "top";
    ctx.fillText(`Llaves: ${keys}`, 12, 10);
    ctx.restore();
  }
}

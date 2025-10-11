import { type Input } from "../io/input.js";
import { type PlayerCharacter } from "./player.js";
import { type NPC } from "./npc.js";

export class DialogueBox {
  active: boolean;
  lines: string[];
  index: number;
  constructor() {
    this.active = false;
    this.lines = [];
    this.index = 0;
  }
  open(lines: string[]) {
    this.lines = lines;
    this.index = 0;
    this.active = true;
  }
  advance() {
    if (!this.active) return;
    this.index++;
    if (this.index >= this.lines.length) this.close();
  }
  close() {
    this.active = false;
    this.lines = [];
    this.index = 0;
  }
  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!this.active) return;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(6, h - 60, w - 12, 54);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.strokeRect(6.5, h - 59.5, w - 13, 53);
    ctx.fillStyle = "#fff";
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    const text = this.lines[this.index] || "";
    const words = text.split(" ");
    let line = "";
    let y = h - 56;
    const maxWidth = w - 24;
    for (let i = 0; i < words.length; i++) {
      const test = line.length ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, 12, y);
        y += 12;
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 12, y);
    ctx.restore();
  }
}

export class InteractionController {
  npcs: NPC[];
  dialogue: DialogueBox;
  constructor() {
    this.npcs = [];
    this.dialogue = new DialogueBox();
  }
  addNPC(npc: NPC) {
    this.npcs.push(npc);
  }
  isFacing(player: PlayerCharacter, npc: NPC) {
    const px = player.tileX;
    const py = player.tileY;
    if (player.facing === "down")
      return npc.tileX === px && npc.tileY === py + 1;
    if (player.facing === "up") return npc.tileX === px && npc.tileY === py - 1;
    if (player.facing === "left")
      return npc.tileX === px - 1 && npc.tileY === py;
    return npc.tileX === px + 1 && npc.tileY === py;
  }
  tryInteract(player: PlayerCharacter, input: Input) {
    if (this.dialogue.active) return;
    if (!input.actionPressed("action")) return;
    for (const npc of this.npcs) {
      if (this.isFacing(player, npc)) {
        this.dialogue.open(npc.dialog);
        break;
      }
    }
  }
  updateDuringDialogue(input: Input) {
    if (!this.dialogue.active) return;
    if (input.actionPressed("action")) this.dialogue.advance();
    if (input.actionPressed("cancel")) this.dialogue.close();
  }
  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.dialogue.draw(ctx, w, h);
  }

  isNPCTile(tx: number, ty: number) {
    for (const n of this.npcs) {
      if (n.tileX === tx && n.tileY === ty) return true;
    }

    return false;
  }
}

import { type Input } from "../io/input.js";
import { type PlayerCharacter } from "./player.js";
import { type NPC } from "./npc.js";
import { DialogUI } from "../ui/dialog/box.js";

export class InteractionController {
  npcs: NPC[];
  dialogue: DialogUI;

  constructor() {
    this.npcs = [];
    this.dialogue = new DialogUI();
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

  tryInteract(
    player: PlayerCharacter,
    input: Input,
    ctx: CanvasRenderingContext2D,
    viewportW: number,
    viewportH: number,
  ) {
    if (this.dialogue.active) return;
    if (!input.actionPressed("action")) return;
    for (const npc of this.npcs) {
      if (this.isFacing(player, npc)) {
        this.dialogue.open(ctx, npc.dialog, viewportW, viewportH);
        break;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.dialogue.draw(ctx);
  }

  public update(input: Input, dt: number) {
    if (!this.dialogue.active) return;
    this.dialogue.update(dt);
    if (input.actionPressed("action")) this.dialogue.advance();
    if (input.actionPressed("cancel")) this.dialogue.close();
  }

  isNPCTile(tx: number, ty: number) {
    for (const n of this.npcs) {
      if (n.tileX === tx && n.tileY === ty) return true;
    }

    return false;
  }
}

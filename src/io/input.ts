import { type Action } from "../types/index.js";

export class Input {
  down: Set<string>;
  pressed: Set<string>;
  released: Set<string>;
  bindings: Record<Action, string[]>;

  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.bindings = {
      up: ["ArrowUp", "KeyW"],
      down: ["ArrowDown", "KeyS"],
      left: ["ArrowLeft", "KeyA"],
      right: ["ArrowRight", "KeyD"],
      action: ["KeyZ", "Enter"],
      cancel: ["KeyX", "Backspace"],
      menu: ["Escape"],
      debug: ["Tab"],
    };
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);
      if (e.code === "Tab") e.preventDefault();
    });
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      this.down.delete(e.code);
      this.released.add(e.code);
    });
  }

  nextFrame() {
    this.pressed.clear();
    this.released.clear();
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  wasPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  wasReleased(code: string): boolean {
    return this.released.has(code);
  }

  actionDown(a: Action): boolean {
    const keys = this.bindings[a] || [];
    for (const k of keys) if (this.down.has(k)) return true;
    return false;
  }

  actionPressed(a: Action): boolean {
    const keys = this.bindings[a] || [];
    for (const k of keys) if (this.pressed.has(k)) return true;
    return false;
  }

  actionReleased(a: Action): boolean {
    const keys = this.bindings[a] || [];
    for (const k of keys) if (this.released.has(k)) return true;
    return false;
  }
}

import { TileId } from "../utils/enums.js";

export class GameState {
  static instance = new GameState();
  flags: Set<string>;
  items: Record<string, number>;

  private constructor() {
    this.flags = new Set();
    this.items = {};
  }

  hasFlag(key: string): boolean {
    return this.flags.has(key);
  }

  setFlags(key: string): void {
    this.flags.add(key);
  }

  hasItem(name: string, itemType = TileId.WALL): boolean {
    return (this.items[name] ?? TileId.FLOOR) >= itemType;
  }

  addItem(name: string, itemType = TileId.WALL) {
    this.items[name] = (this.items[name] ?? TileId.FLOOR) + itemType;
  }

  consumeItem(name: string, itemType = TileId.WALL) {
    if (!this.hasItem(name, itemType)) return false;
    this.items[name] -= itemType;
    return true;
  }
}

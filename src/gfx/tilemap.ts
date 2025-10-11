import { type MapSpec } from "../types/index.js";

export class Tilemap {
  width: number;
  height: number;
  tileSize: number;
  columns: number;
  ground: Uint16Array;
  collision: Uint8Array;
  tileset: HTMLImageElement;

  constructor(spec: MapSpec, tileset: HTMLImageElement) {
    this.width = spec.width;
    this.height = spec.height;
    this.tileSize = spec.tileSize;
    this.columns = spec.columns;
    this.ground = new Uint16Array(this.width * this.height);
    this.collision = new Uint8Array(this.width * this.height);
    this.tileset = tileset;
    this.generate();
  }

  generate(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        let t = 0;
        let solid = 0;
        if (
          x === 0 ||
          y === 0 ||
          x === this.width - 1 ||
          y === this.height - 1
        ) {
          t = 1;
          solid = 1;
        }

        if (x === 10 && y > 3 && y < this.height - 4) {
          t = 1;
          solid = 1;
        }

        this.ground[i] = t;
        this.collision[i] = solid;
      }
    }
  }

  index(x: number, y: number): number {
    return y * this.width + x;
  }

  isSolidTile(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return true;
    return this.collision[this.index(tx, ty)] === 1;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    camx: number,
    camy: number,
    viewW: number,
    viewH: number,
  ): void {
    const tileSize = this.tileSize;
    const startX = Math.floor(camx / tileSize);
    const startY = Math.floor(camy / tileSize);
    const endX = Math.min(this.width, Math.ceil((camx + viewW) / tileSize) + 1);
    const endY = Math.min(
      this.height,
      Math.ceil((camy + viewH) / tileSize) + 1,
    );

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const index = this.index(tx, ty);
        const id = this.ground[index];
        const sx = (id % this.columns) * tileSize;
        const sy = Math.floor(id / this.columns) * tileSize;
        const dx = tx * tileSize - camx;
        const dy = ty * tileSize - camy;
        ctx.drawImage(
          this.tileset,
          sx,
          sy,
          tileSize,
          tileSize,
          dx,
          dy,
          tileSize,
          tileSize,
        );
      }
    }
  }
}

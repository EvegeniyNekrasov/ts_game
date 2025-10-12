export class TextPrinter {
  text: string;
  lines: string[];
  pages: string[][];
  pageIndex: number;
  visible: number;
  cps: number;
  donePage: boolean;

  constructor(cps = 40) {
    this.text = "";
    this.lines = [];
    this.pages = [];
    this.pageIndex = 0;
    this.visible = 0;
    this.cps = cps;
    this.donePage = false;
  }

  public wrap(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    if (text === "") return [""];
    const words = text.split(/\s+/);
    const out: string[] = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const test = line.length ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth) {
        if (line) out.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
    return out;
  }

  public paginate(lines: string[], maxLines: number): string[][] {
    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += maxLines) {
      pages.push(lines.slice(i, i + maxLines));
    }
    return pages.length ? pages : [[]];
  }

  public open(
    ctx: CanvasRenderingContext2D,
    lines: string[],
    maxWidth: number,
    maxLines: number,
  ) {
    const raw: string[] = [];
    for (const s of lines) {
      const parts = String(s).split("\n");
      for (const p of parts) {
        const wrapped = this.wrap(ctx, p, maxWidth);
        if (wrapped.length === 0) raw.push("");
        else raw.push(...wrapped);
      }
    }
    this.lines = raw;
    this.pages = this.paginate(this.lines, maxLines);
    this.pageIndex = 0;
    this.visible = 0;
    this.donePage = false;
  }

  public hasNext(): boolean {
    return this.pageIndex < this.pages.length - 1;
  }

  public nextPage(): void {
    if (!this.hasNext()) return;
    this.pageIndex++;
    this.visible = 0;
    this.donePage = false;
  }

  public skipPage(): void {
    const page = this.pages[this.pageIndex];
    const total = page.join("\n").length + Math.max(0, page.length - 1);
    this.visible = total;
    this.donePage = true;
  }

  public update(dt: number): void {
    if (this.donePage) return;
    this.visible += this.cps * dt;

    const page = this.pages[this.pageIndex];
    const total = page.join("\n").length + Math.max(0, page.length - 1);

    if (total <= 0) {
      this.visible = 0;
      this.donePage = true;
      return;
    }
    if (this.visible >= total) {
      this.visible = total;
      this.donePage = true;
    }
  }

  public currentLines(): string[] {
    const page = this.pages[this.pageIndex];
    let remaining = Math.floor(this.visible);
    const out: string[] = [];
    for (let i = 0; i < page.length; i++) {
      const line = page[i];
      if (remaining <= 0) break;
      if (remaining >= line.length) {
        out.push(line);
        remaining -= line.length;
        if (i < page.length - 1 && remaining > 0) remaining -= 1;
      } else {
        out.push(line.slice(0, remaining));
        remaining = 0;
      }
    }
    return out;
  }
}

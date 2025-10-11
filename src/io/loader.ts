import { type AssetsManifest } from "../types/index.js";

export class Assets {
  private images: Map<string, HTMLImageElement>;
  private json: Map<string, unknown>;
  private audio: Map<string, HTMLImageElement>;
  private total: number;
  private loaded: number;

  constructor() {
    this.images = new Map();
    this.json = new Map();
    this.audio = new Map();
    this.total = 0;
    this.loaded = 0;
  }

  get progress(): number {
    if (this.total === 0) return 1;
    return this.loaded / this.total;
  }

  hasImage(key: string): boolean {
    return this.images.has(key);
  }

  hasJSON(key: string): boolean {
    return this.json.has(key);
  }

  hasAudio(key: string): boolean {
    return this.audio.has(key);
  }

  getImage(key: string) {
    const item = this.images.get(key);
    if (!item) throw new Error(`image:${key} not found`);
    return item;
  }

  getJSON<T = unknown>(key: string) {
    const item = this.json.get(key);
    if (item === undefined) throw new Error(`json:${key} not found`);
    return item as T;
  }

  getAudio(key: string) {
    const item = this.audio.get(key);
    if (!item) throw new Error(`audio:${key} not found`);
    return item;
  }

  async loadAll(manifest: AssetsManifest): Promise<void> {
    const tasks: Promise<void>[] = [];
    const images = Object.entries(manifest.images || {});
    const json = Object.entries(manifest.json || {});
    const audios = Object.entries(manifest.audio || {});

    this.total = images.length + json.length + audios.length;
    this.loaded = 0;

    for (const [k, url] of images) tasks.push(this.loadImage(k, url));
    for (const [k, url] of json) tasks.push(this.loadJSON(k, url));
    for (const [k, url] of audios) tasks.push(this.loadAudio(k, url));

    if (tasks.length === 0) return;
    await Promise.all(tasks);
  }

  private async loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        this.images.set(key, image);
        this.loaded++;
        resolve();
      };

      image.onerror = () => reject(new Error(`image load failed: ${url}`));
      image.src = url;
    });
  }

  private async loadJSON(key: string, url: string): Promise<void> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`json load failed: ${url}`);
    const data = await response.json();
    this.json.set(key, data);
    this.loaded++;
  }

  private async loadAudio(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const onReady = () => {
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("error", onError);
        this.loaded++;
        resolve();
      };
      const onError = () => {
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("error", onError);
        reject(new Error(`audio load failed: ${url}`));
      };

      audio.preload = "auto";
      audio.addEventListener("canplaythrough", onReady, { once: true });
      audio.addEventListener("error", onError, { once: true });
      audio.src = url;
      audio.load();
    });
  }
}

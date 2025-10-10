import { startLoop } from "./core/loop.js";

const WIDTH = 320;
const HEIGHT = 180;
const screen_canvas = document.getElementById("screen") as HTMLCanvasElement;
const ctx = screen_canvas.getContext("2d") as CanvasRenderingContext2D;
const back = document.createElement("canvas");
const bctx = back.getContext("2d") as CanvasRenderingContext2D;
back.width = WIDTH;
back.height = HEIGHT;
let last = 0;
let acc = 0;
const step = 1 / 60;

let x = WIDTH / 2;
let y = HEIGHT / 2;
let vx = 60;
let vy = 40;
const s = 16;

function resize(): void {
  const ww: number = window.innerWidth;
  const wh: number = window.innerHeight;
  const scale: number = Math.max(
    1,
    Math.floor(Math.min(ww / WIDTH, wh / HEIGHT)),
  );
  screen_canvas.width = WIDTH * scale;
  screen_canvas.height = HEIGHT * scale;
}

function update(dt: number) {
  x += vx * dt;
  y += vy * dt;
  if (x < 0) {
    x = 0;
    vx = -vx;
  }

  if (y < 0) {
    y = 0;
    vy = -vy;
  }

  if (x + s > WIDTH) {
    x = WIDTH - s;
    vx = -vx;
  }

  if (y + s > HEIGHT) {
    y = HEIGHT;
    vy = -vy;
  }
}

function render(): void {
  bctx.fillStyle = "#111";
  bctx.fillRect(0, 0, WIDTH, HEIGHT);
  bctx.strokeStyle = "rgba(255,255,255,0.05)";
  bctx.lineWidth = 1;
  for (let i = 0; i <= WIDTH; i++) {
    bctx.beginPath();
    bctx.moveTo(i + 0.5, 0);
    bctx.lineTo(i + 0.5, HEIGHT);
    bctx.stroke();
  }
  for (let j = 0; j <= HEIGHT; j++) {
    bctx.beginPath();
    bctx.moveTo(0, j + 0.5);
    bctx.lineTo(WIDTH, j + 0.5);
    bctx.stroke();
  }
  bctx.fillStyle = "#f90";
  bctx.fillRect(x, y, s, s);
  bctx.fillStyle = "#fff";
  bctx.font = "10px monospace";
  bctx.fillText("RETRO RPG", 8, 14);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(back, 0, 0, screen_canvas.width, screen_canvas.height);
}

window.addEventListener("resize", resize);
resize();

startLoop(update, render, 60);

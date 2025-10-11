import { startLoop } from "./core/loop.js";
import { Input } from "./io/input.js";
import { DebugOverlay } from "./ui/debug.js";
const WIDTH = 320;
const HEIGHT = 180;
const screen_canvas = document.getElementById("screen");
const ctx = screen_canvas.getContext("2d");
const back = document.createElement("canvas");
const bctx = back.getContext("2d");
back.width = WIDTH;
back.height = HEIGHT;
const input = new Input();
const debug = new DebugOverlay();
let scale = 1;
let x = WIDTH / 2;
let y = HEIGHT / 2;
let vx = 0;
let vy = 0;
const s = 16;
const speed = 80;
function resize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    scale = Math.max(1, Math.floor(Math.min(ww / WIDTH, wh / HEIGHT)));
    screen_canvas.width = WIDTH * scale;
    screen_canvas.height = HEIGHT * scale;
    debug.setScale(scale);
}
function handleInput(dt) {
    vx = 0;
    vy = 0;
    if (input.actionDown("left"))
        vx -= speed;
    if (input.actionDown("right"))
        vx += speed;
    if (input.actionDown("up"))
        vy -= speed;
    if (input.actionDown("down"))
        vy += speed;
    x += vx * dt;
    y += vy * dt;
    if (x < 0)
        x = 0;
    if (y < 0)
        y = 0;
    if (x + s > WIDTH)
        x = WIDTH - s;
    if (y + s > HEIGHT)
        y = HEIGHT - s;
    if (input.actionPressed("debug"))
        debug.toggle();
}
function update(dt) {
    handleInput(dt);
    debug.update(dt);
    input.nextFrame();
}
function render() {
    bctx.fillStyle = "#111";
    bctx.fillRect(0, 0, WIDTH, HEIGHT);
    bctx.strokeStyle = "rgba(255,255,255,0.05)";
    bctx.lineWidth = 1;
    for (let i = 0; i <= WIDTH; i += 16) {
        bctx.beginPath();
        bctx.moveTo(i + 0.5, 0);
        bctx.lineTo(i + 0.5, HEIGHT);
        bctx.stroke();
    }
    for (let j = 0; j <= HEIGHT; j += 16) {
        bctx.beginPath();
        bctx.moveTo(0, j + 0.5);
        bctx.lineTo(WIDTH, j + 0.5);
        bctx.stroke();
    }
    bctx.fillStyle = "#f90";
    bctx.fillRect(x, y, s, s);
    debug.draw(bctx, WIDTH, HEIGHT);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(back, 0, 0, screen_canvas.width, screen_canvas.height);
}
window.addEventListener("resize", resize);
resize();
startLoop(update, render, 60);
//# sourceMappingURL=main.js.map
import { startLoop } from "./core/loop.js";
import { Input } from "./io/input.js";
import { DebugOverlay } from "./ui/debug.js";
import { Assets } from "./io/loader.js";
import { Tilemap } from "./gfx/tilemap.js";
import { Camera } from "./gfx/cameras.js";
import { type MapSpec } from "./types/index.js";
import { PlayerCharacter } from "./game/player.js";

const WIDTH = 320;
const HEIGHT = 180;
const screen_canvas = document.getElementById("screen") as HTMLCanvasElement;
const ctx = screen_canvas.getContext("2d") as CanvasRenderingContext2D;
const back = document.createElement("canvas");
const bctx = back.getContext("2d") as CanvasRenderingContext2D;
back.width = WIDTH;
back.height = HEIGHT;

const input = new Input();
const debug = new DebugOverlay();
const assets = new Assets();

let scale = 4;
function resize(): void {
  const ww: number = window.innerWidth;
  const wh: number = window.innerHeight;
  scale = Math.max(1, Math.floor(Math.min(ww / WIDTH, wh / HEIGHT)));
  screen_canvas.width = WIDTH * scale;
  screen_canvas.height = HEIGHT * scale;
  debug.setScale(scale);
}

let ready = false;
const svgTiles =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16"><rect x="0" y="0" width="16" height="16" fill="%231a1a1a"/><rect x="16" y="0" width="16" height="16" fill="%2344aa88"/></svg>';
const mapJson =
  'data:application/json,{"width":40,"height":22,"tileSize":16,"columns":2}';
let tilemap: Tilemap;
let camera: Camera;
let playerCharacter: PlayerCharacter;

assets
  .loadAll({
    images: { tiles: svgTiles },
    json: { map: mapJson },
  })
  .then(() => {
    const spec = assets.getJSON<MapSpec>("map");
    const tileset = assets.getImage("tiles");
    tilemap = new Tilemap(spec, tileset);
    camera = new Camera(
      WIDTH,
      HEIGHT,
      tilemap.width * tilemap.tileSize,
      tilemap.height * tilemap.tileSize,
    );
    playerCharacter = new PlayerCharacter(tilemap, 2, 2, 6);
    ready = true;
  });

function update(dt: number) {
  if (ready) {
    playerCharacter.update(input, dt);
    camera.focus(playerCharacter.centerX(), playerCharacter.centerY());
  }
  if (input.actionPressed("debug")) debug.toggle();
  debug.update(dt);
  input.nextFrame();
}

function render() {
  bctx.fillStyle = "#000";
  bctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (!ready) {
    bctx.fillStyle = "#fff";
    bctx.font = "10px monospace";
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.fillText("LOADING...", WIDTH / 2, HEIGHT / 2);
  } else {
    tilemap.draw(bctx, camera.x, camera.y, WIDTH, HEIGHT);
    playerCharacter.draw(bctx, camera.x, camera.y);
    bctx.strokeStyle = "rgba(255,255,255,0.06)";
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
    debug.draw(bctx, WIDTH, HEIGHT);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(back, 0, 0, screen.width, screen.height);
}

window.addEventListener("resize", resize);
resize();

startLoop(update, render, 60);

import { startLoop } from "./core/loop.js";
import { Input } from "./io/input.js";
import { DebugOverlay } from "./ui/debug.js";
import { Assets } from "./io/loader.js";
import { Tilemap } from "./gfx/tilemap.js";
import { Camera } from "./gfx/cameras.js";
import { PlayerCharacter } from "./game/player.js";
import { SpriteSheet } from "./gfx/sprites.js";
import { NPC } from "./game/npc.js";
import { InteractionController } from "./game/interact.js";

const VIEWPORT_WIDTH = 320;
const VIEWPORT_HEIGHT = 220;

const screen_canvas = document.getElementById("screen") as HTMLCanvasElement;
const ctx = screen_canvas.getContext("2d") as CanvasRenderingContext2D;
const back = document.createElement("canvas");
const bctx = back.getContext("2d") as CanvasRenderingContext2D;
back.width = VIEWPORT_WIDTH;
back.height = VIEWPORT_HEIGHT;

const input = new Input();
const debug = new DebugOverlay();
const assets = new Assets();
const interactions = new InteractionController();

let scale = 1;
function resize() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  scale = Math.max(
    1,
    Math.floor(Math.min(ww / VIEWPORT_WIDTH, wh / VIEWPORT_HEIGHT)),
  );
  screen_canvas.width = VIEWPORT_WIDTH * scale;
  screen_canvas.height = VIEWPORT_HEIGHT * scale;
  debug.setScale(scale);
}

// Thanx to GPT XD
const tilesetDataURI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16">
      <defs>
        <pattern id="floor" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#1e1e1e"/>
          <rect width="2" height="2" fill="#232323"/>
          <rect x="2" y="2" width="2" height="2" fill="#232323"/>
        </pattern>
        <pattern id="brick" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#2a2a2a"/>
          <rect x="0" y="0" width="8" height="1" fill="#141414"/>
          <rect x="0" y="4" width="8" height="1" fill="#141414"/>
          <rect x="0" y="0" width="1" height="4" fill="#141414"/>
          <rect x="4" y="4" width="1" height="4" fill="#141414"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="16" height="16" fill="url(#floor)"/>
      <rect x="16" y="0" width="16" height="16" fill="url(#brick)"/>
    </svg>`,
  );

const playerSheetDataURI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64" shape-rendering="crispEdges">
      <rect x="0" y="0" width="16" height="16" fill="#ffd54a"/>
      <rect x="16" y="0" width="16" height="16" fill="#ffb300"/>
      <rect x="0" y="16" width="16" height="16" fill="#4caf50"/>
      <rect x="16" y="16" width="16" height="16" fill="#388e3c"/>
      <rect x="0" y="32" width="16" height="16" fill="#42a5f5"/>
      <rect x="16" y="32" width="16" height="16" fill="#1e88e5"/>
      <rect x="0" y="48" width="16" height="16" fill="#ab47bc"/>
      <rect x="16" y="48" width="16" height="16" fill="#8e24aa"/>
    </svg>`,
  );

const mapSpecDataURI =
  'data:application/json,{"width":60,"height":34,"tileSize":16,"columns":2}';

let ready = false;
let tileMap: Tilemap;
let camera: Camera;
let playerCharacter: PlayerCharacter;

assets
  .loadAll({
    images: { tiles: tilesetDataURI, player: playerSheetDataURI },
    json: { map: mapSpecDataURI },
  })
  .then(() => {
    const spec = assets.getJSON<{
      width: number;
      height: number;
      tileSize: number;
      columns: number;
    }>("map");
    const tileset = assets.getImage("tiles");
    const playerImage = assets.getImage("player");

    tileMap = new Tilemap(spec, tileset);
    camera = new Camera(
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
      tileMap.width * tileMap.tileSize,
      tileMap.height * tileMap.tileSize,
    );
    const playerSheet = new SpriteSheet(playerImage, 16, 16, 2);
    const isBlocked = (tx: number, ty: number) =>
      tileMap.isSolidTile(tx, ty) || interactions.isNPCTile(tx, ty);
    playerCharacter = new PlayerCharacter(
      tileMap,
      4,
      4,
      7,
      playerSheet,
      isBlocked,
    );
    interactions.addNPC(
      new NPC(8, 4, tileMap.tileSize, "#66c2ff", [
        "Hola, aventurero.",
        "Pulsa Z para avanzar.",
        "Suerte en tu viaje.",
      ]),
    );
    interactions.addNPC(
      new NPC(12, 10, tileMap.tileSize, "#ff6699", [
        "Dicen que hay un tesoro al norte.",
        "Pero el muro es alto.",
        "Busca un desvío.",
      ]),
    );
    ready = true;
  });

function update(dt: number) {
  if (ready) {
    if (interactions.dialogue.active) {
      interactions.updateDuringDialogue(input);
    } else {
      playerCharacter.update(input, dt);
      interactions.tryInteract(playerCharacter, input);
    }
    camera.focus(playerCharacter.centerX(), playerCharacter.centerY());
  }
  if (input.actionPressed("debug")) debug.toggle();
  debug.update(dt);
  input.nextFrame();
}

function render() {
  bctx.fillStyle = "#000";
  bctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  if (!ready) {
    bctx.fillStyle = "#fff";
    bctx.font = "10px monospace";
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.fillText("LOADING...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2);
  } else {
    tileMap.draw(bctx, camera.x, camera.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    for (const npc of interactions.npcs) {
      npc.draw(bctx, camera.x, camera.y);
    }
    playerCharacter.draw(bctx, camera.x, camera.y);
    interactions.draw(bctx, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    bctx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i <= VIEWPORT_WIDTH; i += 16) {
      bctx.beginPath();
      bctx.moveTo(i + 0.5, 0);
      bctx.lineTo(i + 0.5, VIEWPORT_HEIGHT);
      bctx.stroke();
    }
    for (let j = 0; j <= VIEWPORT_HEIGHT; j += 16) {
      bctx.beginPath();
      bctx.moveTo(0, j + 0.5);
      bctx.lineTo(VIEWPORT_WIDTH, j + 0.5);
      bctx.stroke();
    }
    debug.draw(bctx, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(back, 0, 0, screen_canvas.width, screen_canvas.height);
}

window.addEventListener("resize", resize);
resize();

startLoop(update, render, 60);

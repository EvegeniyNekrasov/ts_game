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
const PIXE_ZISE = 16;
const START_POSITION = 4;
const TILES_PER_SECOND = 4;

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

const mapSpecDataURI =
  'data:application/json,{"width":60,"height":34,"tileSize":16,"columns":2}';

let ready = false;
let tileMap: Tilemap;
let camera: Camera;
let playerCharacter: PlayerCharacter;

assets
  .loadAll({
    images: {
      tiles: "/assets/tiles/tiles.png",
      player: "/assets/sprites/player.png",
      npc1: "/assets/npc/villager_red.png",
      npc2: "/assets/npc/villager_green.png",
      npc3: "/assets/npc/villager_blue.png",
      npc4: "/assets/npc/sage_purple.png",
      npc5: "/assets/npc/guard_teal.png",
    },
    json: { map: mapSpecDataURI },
  })
  .then(() => {
    const base = assets.getJSON<{
      width: number;
      height: number;
      tileSize: number;
      columns: number;
    }>("map");

    const spec = assets.getJSON<{
      width: number;
      height: number;
      tileSize: number;
      columns: number;
    }>("map");

    const npc1 = new SpriteSheet(assets.getImage("npc1"), 16, 16, 3);
    const npc2 = new SpriteSheet(assets.getImage("npc2"), 16, 16, 3);
    const tiles = assets.getImage("tiles");

    const tileset = assets.getImage("tiles");
    const playerImage = assets.getImage("player");

    tileMap = new Tilemap(spec, tileset);

    camera = new Camera(
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
      tileMap.width * tileMap.tileSize,
      tileMap.height * tileMap.tileSize,
    );
    const playerSheet = new SpriteSheet(playerImage, PIXE_ZISE, PIXE_ZISE, 3);

    const isBlocked = (tx: number, ty: number) =>
      tileMap.isSolidTile(tx, ty) || interactions.isNPCTile(tx, ty);

    playerCharacter = new PlayerCharacter(
      tileMap,
      START_POSITION,
      START_POSITION,
      TILES_PER_SECOND,
      playerSheet,
      isBlocked,
    );
    interactions.addNPC(
      new NPC(8, 4, tileMap.tileSize, npc1, null, "down", [
        "Hola, aventurero.",
        "Pulsa Z para avanzar.",
        "Suerte en tu viaje.",
        "max texto de prueba",
        "alksdjalsjd",
        "tortilla de patatas",
      ]),
    );
    ready = true;
  });

function update(dt: number) {
  if (ready) {
    if (interactions.dialogue.active) {
      interactions.update(input, dt);
    } else {
      playerCharacter.update(input, dt);
      interactions.tryInteract(
        playerCharacter,
        input,
        bctx,
        back.width,
        back.height,
      );
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
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.globalAlpha = 1;
    interactions.draw(bctx);
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

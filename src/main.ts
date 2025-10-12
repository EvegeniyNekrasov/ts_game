import { startLoop } from "./core/loop.js";
import { Input } from "./io/input.js";
import { DebugOverlay } from "./ui/debug.js";
import { Assets } from "./io/loader.js";
import { Tilemap } from "./gfx/tilemap.js";
import { Camera } from "./gfx/cameras.js";
import { PlayerCharacter } from "./game/player.js";
import { SpriteSheet } from "./gfx/sprites.js";
import { InteractionController } from "./game/interact.js";
import { buildWorld } from "./game/world.js";
import { type TriggerController } from "./game/triggers.js";
import { type MapJSON } from "./types/index.js";

const VIEWPORT_WIDTH = 320;
const VIEWPORT_HEIGHT = 220;
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

let ready = false;
let tileMap: Tilemap;
let camera: Camera;
let playerCharacter: PlayerCharacter;
let triggers: TriggerController;

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
    json: { map: "/assets/maps/demo.json" },
  })
  .then(() => {
    const mapJson = assets.getJSON<MapJSON>("map");

    const FRAME_DIMENTION = 16;

    const npcSheets = {
      npc1: new SpriteSheet(
        assets.getImage("npc1"),
        FRAME_DIMENTION,
        FRAME_DIMENTION,
        3,
      ),
      npc2: new SpriteSheet(
        assets.getImage("npc2"),
        FRAME_DIMENTION,
        FRAME_DIMENTION,
        3,
      ),
      npc3: new SpriteSheet(
        assets.getImage("npc3"),
        FRAME_DIMENTION,
        FRAME_DIMENTION,
        3,
      ),
      npc4: new SpriteSheet(
        assets.getImage("npc4"),
        FRAME_DIMENTION,
        FRAME_DIMENTION,
        3,
      ),
      npc5: new SpriteSheet(
        assets.getImage("npc5"),
        FRAME_DIMENTION,
        FRAME_DIMENTION,
        3,
      ),
    };

    const tilesImage = assets.getImage("tiles");
    const world = buildWorld(mapJson, tilesImage, npcSheets);

    tileMap = world.tilemap;
    triggers = world.triggers;
    camera = new Camera(
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
      tileMap.width * tileMap.tileSize,
      tileMap.height * tileMap.tileSize,
    );

    for (const n of world.npcs) interactions.addNPC(n);

    const playerSheet = new SpriteSheet(
      assets.getImage("player"),
      FRAME_DIMENTION,
      FRAME_DIMENTION,
      3,
    );

    const isBlocked = (tx: number, ty: number) =>
      tileMap.isSolidTile(tx, ty) || interactions.isNPCTile(tx, ty);

    playerCharacter = new PlayerCharacter(
      tileMap,
      world.playerStart.x,
      world.playerStart.y,
      TILES_PER_SECOND,
      playerSheet,
      isBlocked,
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
      triggers.tryUse(
        playerCharacter,
        input.actionPressed("action"),
        tileMap,
        interactions.dialogue,
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
    for (const npc of interactions.npcs) npc.draw(bctx, camera.x, camera.y);
    playerCharacter.draw(bctx, camera.x, camera.y);

    const f = triggers.facingCell(
      playerCharacter.tileX,
      playerCharacter.tileY,
      playerCharacter.facing,
    );
    bctx.save();
    bctx.globalAlpha = 0.25;
    bctx.fillStyle = "#ff0";
    bctx.fillRect(
      f.x * tileMap.tileSize - camera.x,
      f.y * tileMap.tileSize - camera.y,
      tileMap.tileSize,
      tileMap.tileSize,
    );
    bctx.restore();

    triggers.draw(bctx, camera.x, camera.y, tileMap.tileSize);

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

    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.globalAlpha = 1;
    interactions.draw(bctx);
    debug.draw(bctx, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(back, 0, 0, screen_canvas.width, screen_canvas.height);
}

window.addEventListener("resize", resize);
resize();

startLoop(update, render, 60);

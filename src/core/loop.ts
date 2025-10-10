import { Clock } from "./time.js";

export type LoopHandle = {
  stop: () => void;
  start: () => void;
  isRunning: () => boolean;
};

export function startLoop(
  update: (dt: number) => void,
  render: () => void,
  hz = 60,
): LoopHandle {
  const clock = new Clock(1 / hz);
  let running = true;
  function frame(ts: number) {
    if (!running) return;

    clock.tick(ts, update);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {
    stop() {
      running = false;
    },
    start() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    },
    isRunning() {
      return running;
    },
  };
}

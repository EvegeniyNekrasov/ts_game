export class Clock {
  step: number;
  last: number;
  acc: number;

  constructor(step = 1 / 60) {
    this.step = step;
    this.last = 0;
    this.acc = 0;
  }

  tick(ts: number, update: (dt: number) => void) {
    const now = ts / 1000;
    if (this.last === 0) this.last = now;
    let dt = now - this.last;
    if (dt > 0.25) dt = 0.25;
    this.last = now;
    this.acc += dt;
    while (this.acc >= this.step) {
      update(this.step);
      this.acc -= this.step;
    }
  }
}

import Game from "./Game";
import { getRandom, getRandomInteger } from "./random";

export default class ParticleSystem {
  constructor(game) {
    /**
     * @type {Game}
     */
    this.game = game;

    /**
     * @type {Array.<{ x: number, y: number, size: number, ticks: number, vx: number, vy: number, alpha: number }>}
     */
    this.particles = [];
  }

  spawnParticles(x, y, amount = 5, sizeScale = 1) {
    var realAmount =
      amount === 1 ? amount : getRandomInteger(amount * 0.9, amount * 1.1);

    for (var i = 0; i < realAmount; i++) {
      var angle = getRandom(0, Math.PI * 2);
      var speed = getRandom(0.1, 6) / 100;

      var dx = (Math.cos(angle) * getRandom(3, 5)) / 100;
      var dy = (Math.sin(angle) * getRandom(3, 5)) / 100;

      this.particles.push({
        x: x + dx,
        y: y + dy,
        size: getRandom(3, 6 * sizeScale) / 100,
        ticks: getRandom(0, 1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: getRandom(0, 0.1),
      });
    }
  }

  render() {
    for (var particle of this.particles) {
      this.game.ctx.globalAlpha = Math.min(1, Math.max(0, particle.alpha));

      this.game.render.drawRect(
        particle.x,
        particle.y,
        Math.max(0, particle.size),
        Math.max(0, particle.size),
        "#fff"
      );
    }

    this.game.ctx.globalAlpha = 1;
  }

  update(delta) {
    var deleting = [];

    for (var i = 0; i < this.particles.length; i++) {
      var particle = this.particles[i];

      particle.x += delta * particle.vx;
      particle.y += delta * particle.vy;

      particle.ticks += delta;

      if (particle.ticks > 2) {
        particle.size -= delta / 200;
        particle.alpha -= delta / 2;

        if (particle.size < 0.0001 || particle.alpha < 0.0001) {
          deleting.unshift(i);
        }
      } else if (particle.alpha < 1) {
        particle.alpha += delta * 3;
      }
    }

    for (var i = 0; i < deleting.length; i++) {
      this.particles.splice(deleting[i], 1);
    }
  }
}

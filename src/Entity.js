import GameObject from "./GameObject";

export default class Entity extends GameObject {
  constructor(game) {
    super(game);

    this.w = 0.1;
    this.h = 0.1;

    this.direction = -1;
  }

  render() {
    this.game.render.drawRect(this.x, this.y, this.w, this.h, "#ff2222");
  }

  update(delta) {
    this.x += delta * this.direction * 3;

    super.update();

    if (this.collidesWith(this.game.player)) {
      if (this.game.player.animationName === "attack1") {
        this.direction = this.game.player.facing === 0 ? -1 : 1;

        this.game.particleSystem.spawnParticles(this.x, this.y, 6, 0.5);

        this.game.camera.shake();
      } else if (this.game.player.animationName === "ground_slam") {
        this.colliding = true;
        this.game.camera.shake();
      } else {
        this.game.player.facing = this.direction < 0 ? 1 : 0;

        this.game.player.knockback();
        this.colliding = true;
      }
    }

    if (this.colliding) {
      this.delete = true;

      this.game.particleSystem.spawnParticles(this.x, this.y, 5, 0.3);
    }
  }
}

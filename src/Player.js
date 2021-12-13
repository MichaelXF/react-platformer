import Animation from "./Animation";
import Game from "./Game";
import GameObject from "./GameObject";
import { getDistance } from "./math";
import { getRandomInteger } from "./random";
import { radiansToDegree } from "./util/MathUtil";

export default class Player extends GameObject {
  constructor(game) {
    super(game);
    this.x = 5;
    this.y = 5;

    this.w = 0.55;
    this.h = 0.95;
    this.defaultSize = [this.w, this.h];

    this.onGround = false;
    this.running = false;
    this.gravityTick = 0;

    this.ledgeHang = false;

    this.doubleJumped = false;
    this.frictionValue = 0;
    /**
     * - `0` = Left
     * - `1` = Right
     */
    this.facing = 0;

    /**
     * @type {Game}
     */
    this.game = game;

    this.tiles = {};

    this.lastLandY = 0;

    this.animations = {
      idle: new Animation({
        sprite: "player_idle",
        frames: [0, 1, 2, 3, 4, 5, 6],
        speed: 140,
        after: "idle",
        idle: true,
      }),
      look_up: new Animation({
        sprite: "player_look_up",
        frames: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
        speed: 200,
        after: "idle",
        idle: true,
      }),
      run: new Animation({
        sprite: "player_run",
        frames: [0, 1, 2, 3, 4, 5, 7],
        speed: 120,
      }),
      jump: new Animation({
        sprite: "player_jump",
        frames: [0],
        speed: 110,
        after: "fall",
      }),
      fall: new Animation({
        sprite: "player_jump",
        frames: [1, 2],
        speed: 250,
        after: "fall",
      }),
      land: new Animation({
        sprite: "player_land",
        frames: [0, 1],
        speed: 100,
        after: "idle",
        idle: true,
      }),
      slide: new Animation({
        sprite: "player_slide",
        frames: [0, 1, 2],
        speed: 90,
        after: "slide_transition",
        disableController: false,
        size: [1, 0.6],
        yOffset: -0.4,
        xOffset: [0.3, 0.2],
        timeout: false
      }),
      slide_transition: new Animation({
        sprite: "player_slide",
        frames: [3],
        speed: 100,
        after: "idle",
        idle: true,
      }),
      roll: new Animation({
        sprite: "player_front_flip",
        frames: [5, 6, 7, 8, 9, 10, 11, 12],
        speed: 60,
        after: "fall",
        size: [0.55, 0.6],
        yOffset: -0.15,
      }),
      attack1: new Animation({
        sprite: "player_combat_combo_01_attack_01",
        frames: [0, 1, 2, 3, 4, 5],
        speed: 100,
        after: "idle",
        disableController: true,
      }),
      attack2: new Animation({
        sprite: "player_combat_combo_01_attack_02",
        frames: [0, 1, 2, 3, 4],
        speed: 100,
        after: "idle",
        disableController: true,
      }),
      attack3: new Animation({
        sprite: "player_combat_combo_01_attack_03",
        frames: [0, 1, 2, 3],
        speed: 100,
        after: "idle",
        disableController: true,
      }),
      attack4: new Animation({
        sprite: "player_combat_combo_01_attack_04",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        speed: 100,
        after: "idle",
        disableController: true,
      }),
      ground_slam: new Animation({
        sprite: "player_combat_ground_slam",
        frames: [0, 1, 2, 3, 4, 5, 6],
        speed: 100,
        after: "ground_slam_transition",
        disableController: true,
      }),
      ground_slam_transition: new Animation({
        sprite: "player_combat_ground_slam",
        frames: [7, 8, 9],
        speed: 100,
        after: "idle",
        idle: true,
      }),
      knockback: new Animation({
        sprite: "player_knockback",
        frames: [0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 5],
        speed: 100,
        after: "idle",
        disableController: true,
      }),
      ledge_climb: new Animation({
        sprite: "player_ledge_climb",
        frames: [0, 1, 2, 3, 4, 5, 6, 7],
        speed: 100,
        after: "ledge_climb",
        xOffset: [0.3, -0.3],
        yOffset: 0.9,
      }),
      ledge_hang: new Animation({
        sprite: "player_ledge_hang",
        frames: [0, 1, 2, 3, 4, 5],
        speed: 100,
        after: "ledge_hang",
        xOffset: [-0.1, 0.11],
      }),
      wall_jump: new Animation({
        sprite: "player_wall_jump",
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        speed: 100,
        after: "fall",
      }),
      crouch: new Animation({
        sprite: "player_crouch",
        frames: [0, 1, 2, 3, 4, 5],
        speed: 100,
        after: "crouch",
        size: [0.55, 0.6],
        yOffset: -0.4,
      }),
      crawl: new Animation({
        sprite: "player_crawl",
        frames: [0, 1, 2, 3, 4, 5, 6, 7],
        speed: 120,
        after: "crawl",
        size: [0.55, 0.6],
        yOffset: -0.4,
      }),
    };

    /**
     * @type {Animation}
     */
    this.animation = null;
    this.animationName = "";

    this.setAnimation("idle");
    this.crouch = false;
  }

  setCrouch(value) {
    if (!this.crouch && value) {
      this.setAnimation("crouch");
      this.crouch = true;
    } else if (this.crouch && !value) {
      this.crouch = false;

      this.setAnimation("idle");
    }
  }

  setAnimation(animationName, fixSize = true) {
    if (!this.animations[animationName]) {
      throw new Error("Invalid animation: " + animationName);
    }

    if (animationName !== "crouch" && animationName !== "crawl") {
      this.setCrouch(false);
    }
    var oldAnimation = this.animation;

    this.animation = this.animations[animationName];
    this.animationName = animationName;
    this.animationTick = 0;

    if (this.animation.size) {
      this.w = this.animation.size[0];
      this.h = this.animation.size[1];

      this.x += (this.defaultSize[0] - this.animation.size[0]) / 2;
      this.y += this.defaultSize[1] - this.animation.size[1];
    } else {
      [this.w, this.h] = this.defaultSize;

      if (fixSize) {
        if (oldAnimation && oldAnimation.size) {
          this.x -= (this.w - oldAnimation.size[0]) / 2;
          this.y -= this.h - oldAnimation.size[1];
        }
      }
    }
  }

  attack() {
    this.game.camera.shake(0.15, 0.8);

    this.setAnimation("attack1");
  }

  groundSlam() {
    this.setAnimation("ground_slam");
  }

  jump() {
    if (this.doubleJumped && !this.ledgeHang) {
      return
    }
    this.gravityTick = 0;
    this.velocityX = 0;

    this.lastLandY = null;

    this.game.particleSystem.spawnParticles(
      this.getCenter()[0],
      this.getBottom() - 0.1,
      4,
      0.3
    );

    if (!this.onGround) {
      this.setAnimation("roll");
      this.ledgeHang = false;
      this.doubleJumped = true;

      this.velocityY = -4.85;
    } else {
      this.setAnimation("jump");
      this.velocityY = -5;
    }
  }

  slide() {
    if (this.animations.slide.timeout) {
      //prevent double sliding
      return
    }
    this.animations.slide.timeout = true;
    setTimeout(() => {
      this.animations.slide.timeout = false;
    }, 1500)
    this.setAnimation("slide");
  }

  knockback() {
    this.setAnimation("knockback");
    setTimeout(() => {
      this.velocityX = 0.1 * (this.facing == 0 ? 1 : -1);
    }, 100);
  }

  render(delta) {
    // animator
    this.animationTick += delta * 1000;

    var index = Math.floor(this.animationTick / this.animation.speed);
    var done = false;
    if (index > this.animation.frames.length - 1) {
      if (index > this.animation.frames.length) {
        done = true;
      }

      index = this.animation.frames.length - 1;
    }

    var frame = this.animation.frames[index];

    if (this.game.showInfo) {
      this.game.render.drawRect(
        this.x,
        this.y,
        this.w,
        this.h,
        this.onGround ? "#444" : "#663333"
      );
    }

    var xOffset = 0;

    var [w, h] = this.defaultSize;

    this.game.render.drawSprite(
      {
        sprite: this.animation.sprite,
        frame: frame,
        effects: this.facing == 0 ? ["flipHorizontally"] : [],
      },
      this.x -
        w * 1.55 +
        (Array.isArray(this.animation.xOffset)
          ? this.animation.xOffset[this.facing]
          : this.animation.xOffset) +
        xOffset,
      this.y - h * 1.05 + this.animation.yOffset,
      w * h * 4.3,
      w * h * 4.3 * 0.875
    );

    if (done) {
      if (this.animation.after) {
        if (this.animationName === "idle" && Math.random() > 0.5) {
          this.setAnimation("look_up");
        } else {
          this.setAnimation(this.animation.after);
        }
      } else {
        this.setAnimation(this.animationName);
      }
    }

    // animation logic
    if (this.running) {
      if (this.animation.idle) {
        this.setAnimation("run");
      }
      if (this.animationName === "crouch") {
        this.setAnimation("crawl");
      }
    } else {
      if (this.animationName === "run") {
        this.setAnimation("idle");
      }
      if (this.animationName === "crawl") {
        this.setAnimation("crouch");
      }
    }

    if (!this.onGround) {
      if (
        this.animation.idle ||
        (!this.ledgeHang && this.animationName === "ledge_hang")
      ) {
        this.setAnimation("fall");
      }
    } else {
      if (this.animationName === "fall") {
        this.setAnimation("idle");
      }
    }
  }

  update(delta) {
    var wasOnGround = this.onGround;

    super.update(delta);

    if (!this.onGround && !this.ledgeHang) {
      this.gravityTick += delta;
      this.y += Math.min(this.gravityTick / 5, delta * 10);
    } else {
      this.gravityTick = 0;
    }
    if (!this.animationName.includes("slide")) {
      this.frictionValue = 0;
    } else {
      this.velocityX = Math.sqrt(-0.07 * this.frictionValue + 3) * (this.facing == 0 ? -1 : 1);
      this.frictionValue++
    }
    if (this.onGround) {
      //resetting movement checks
      this.doubleJumped = false

      if (!wasOnGround) {
        var y = Math.floor(this.y);
        if (y !== this.lastLandY) {
          this.lastLandY = y;

          this.game.particleSystem.spawnParticles(
            this.getCenter()[0],
            this.getBottom() - 0.1,
            5,
            0.3
          );

          if (this.velocityY < 0) {
            this.velocityY = 0;
          } else {
          }
          if (
            this.animationName !== "ground_slam" &&
            this.animationName !== "knockback"
          ) {
            this.setAnimation("land", true);
          } else {
            this.game.camera.shake(0.1, 4);
          }
        }
      }
    }

    // game boundaries
    this.x = Math.max(0, Math.min(this.game.levelWidth - this.w, this.x));
    this.y = Math.max(0, Math.min(this.game.levelHeight - this.h, this.y));
  }
}

import Game from "./Game";

export default class GameObject {
  constructor(game) {
    /**
     * @type {Game}
     */
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    this.velocityX = 0;
    this.velocityY = 0;

    this.colliding = false;
    this.delete = false;
  }

  setVelocity(velocityX, velocityY) {
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  setLeft(left) {
    this.x = left;
  }

  getLeft() {
    return this.x;
  }

  setRight(right) {
    this.x = right - this.w;
  }

  getRight() {
    return this.x + this.w;
  }

  setTop(top) {
    this.y = top;
  }

  getTop() {
    return this.y;
  }

  setBottom(bottom) {
    this.y = bottom - this.h;
  }

  getBottom() {
    return this.y + this.h;
  }

  getCenter() {
    return [this.x + this.w / 2, this.y + this.h / 2];
  }

  update(delta) {
    // compute velocity
    if (this.velocityX) {
      var isNegative = this.velocityX < 0;
      var abs = Math.abs(this.velocityX);

      var amount = Math.max(abs * 4 * delta, delta / 2);
      if (amount > abs) {
        amount = abs;
      }

      abs -= amount;
      if (abs < 0) {
        abs = 0;
      }

      this.velocityX = isNegative ? -abs : abs;
      var force = isNegative ? -amount : amount;

      this.x += force;
    }

    if (this.velocityY) {
      var isNegative = this.velocityY < 0;
      var abs = Math.abs(this.velocityY);

      var amount = Math.max(abs * 4 * delta, delta / 2);
      if (amount > abs) {
        amount = abs;
      }

      abs -= amount;
      if (abs < 0) {
        abs = 0;
      }

      this.velocityY = isNegative ? -abs : abs;
      var force = isNegative ? -amount : amount;

      this.y += force;
    }

    this.tiles = {};

    this.onGround = false;
    this.colliding = false;

    var colliding = new Set();

    for (
      var x = Math.floor(this.x) - 1;
      x <= Math.floor(this.x + this.w) + 1;
      x += 0.4
    ) {
      for (
        var y = Math.floor(this.y) - 1;
        y <= Math.floor(this.y + this.h) + 1;
        y += 0.4
      ) {
        var _x = Math.floor(x);
        var _y = Math.floor(y);

        var _index = this.game.convertCoordinatesToIndex(_x, _y);

        if (this.game.collisionMap[_index]) {
          colliding.add(_index);
        }
      }
    }

    var setX = null;
    var setGroundY = 0;
    var groundY = 0;
    var horizontalCollide = null;
    var horizontalFlag = false;

    for (var position of Array.from(colliding)) {
      var index = position;
      var [x, y] = this.game.convertIndexToCoordinates(index);

      var block = {
        x,
        y,
        w: 1,
        h: 1,
      };

      if (this.collidesWith(block)) {
        var side = this.calculateOverlap(block);
        if (side === "top") {
          if (
            !this.crouch &&
            this.calculateOverlap(block, {
              x: this.x,
              y: this.getBottom() - 0.1,
              w: this.w,
              h: 0.1,
            }) !== "top"
          ) {
            side = this.x < block.x ? "left" : "right";
          }
        }
        var flag = {
          left: 1,
          right: 2,
          top: 4,
          bottom: 8,
        }[side];

        if (this.game.collisionMap[index] & flag) {
          this.colliding = true;

          if (side === "top") {
            this.onGround = true;
            groundY = y;
            if (this.getBottom() > y) {
              this.setBottom(y + 0.01);
            }
          } else if (side === "bottom") {
            if (this.getTop() < y + 1) {
              this.setTop(y + 1);
            }
          } else if (side === "left") {
            setX = x - this.w;
            setGroundY = y;
            horizontalCollide = block;
            horizontalFlag = this.facing === 1;
          } else if (side === "right") {
            setX = x + block.w;
            setGroundY = y;
            horizontalCollide = block;
            horizontalFlag = this.facing === 0;
          }

          this.tiles[index] = flag;
        }

        // console.log(this, block);
      }
    }

    if (typeof setX === "number" && groundY !== setGroundY) {
      this.x = setX;

      if (
        !this.onGround &&
        this.animationName !== "crawl" &&
        this.animationName !== "roll" &&
        horizontalFlag &&
        this.game.collisionMap[
          this.game.convertCoordinatesToIndex(
            horizontalCollide.x,
            horizontalCollide.y - 1
          )
        ] &&
        (this.y - Math.floor(this.y) < 0.3 ||
          this.game.collisionMap[
            this.game.convertCoordinatesToIndex(
              horizontalCollide.x,
              horizontalCollide.y + 1
            )
          ])
      ) {
        this.ledgeHang = true;

        if (
          this.animationName !== "ledge_hang" &&
          this.animationName !== "wall_jump"
        ) {
          this.setAnimation("ledge_hang");
        }
      }
    } else {
      if (this.ledgeHang) {
        this.ledgeHang = false;
        this.setAnimation("fall");
      }
    }
  }

  collidesWith(other, overrideThis) {
    var rect1 = overrideThis || this;
    var rect2 = other;

    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.h + rect1.y > rect2.y
    );
  }

  calculateOverlap(other, overrideThis) {
    var r1 = overrideThis || this;
    var r2 = other;

    var dx = r1.x + r1.w / 2 - (r2.x + r2.w / 2);
    var dy = r1.y + r1.h / 2 - (r2.y + r2.h / 2);
    var width = (r1.w + r2.w) / 2;
    var height = (r1.h + r2.h) / 2;
    var crossWidth = width * dy;
    var crossHeight = height * dx;
    var collision = "none";
    //
    if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
      if (crossWidth > crossHeight) {
        collision = crossWidth > -crossHeight ? "bottom" : "left";
      } else {
        collision = crossWidth > -crossHeight ? "right" : "top";
      }
    }
    return collision;
  }
}

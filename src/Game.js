import Camera from "./Camera";
import Controller from "./Controller";
import Entity from "./Entity";
import InputManager from "./InputManager";
import ParticleSystem from "./ParticleSystem";
import Player from "./Player";
import Render from "./Render";
import SpriteSheetManager from "./SpriteSheetManager";
import { v4 } from "uuid";
import { getRandomInteger } from "./random";

export default class Game {
  constructor(canvas, ctx, ssm) {
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvas = canvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = ctx;

    /**
     * @type {SpriteSheetManager}
     */
    this.ssm = ssm;

    this.render = new Render(this);
    this.camera = new Camera(this);

    this.inputManager = new InputManager();
    this.particleSystem = new ParticleSystem(this);

    this.player = new Player(this);
    this.controller = new Controller(this);

    /**
     * @type {Object.<string, Entity>}
     */
    this.entities = {};

    const level = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 5, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0],
      [0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
      [0, 5, 0, 5, 0, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0],
      [0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0],
      [0, 5, 5, 5, 5, 5, 0, 0, 5, 5, 5, 5, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0],
      [0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 5, 0],
      [0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5],
      [0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0],
      [5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
      [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 0, 0, 5, 5, 0, 0, 0, 5, 5, 5, 5],
      [5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5],
      [5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5],
      [5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    ];

    this.showInfo = false;
    this.map = level.flat(1);

    this.levelWidth = level[0].length;
    this.levelHeight = level.length;
    this.camera.endY = this.levelHeight - 7;
    this.camera.startY = this.levelHeight - 15;
    this.camera.maxY = this.levelHeight;
    this.camera.minX = 0;

    this.player.y = this.levelHeight - 12;

    this.spawnTick = 0;
    this.fpsTick = 0;
    this.fps = 0;

    if (this.map.length !== this.levelWidth * this.levelHeight) {
      throw new Error("Invalid map length: " + this.map.length);
    }

    /**
     * - `0` = No collision
     * - `1` = Left
     * - `2` = Right
     * - `4` = Top
     * - `8` = Bottom
     */
    this.collisionMap = this.createCollisionMap();
  }

  end() {
    this.inputManager.end();
  }

  spawnEntity() {
    var id = v4();

    var entity = new Entity(this);
    this.entities[id] = entity;

    var direction = Math.random() > 0.5 ? -1 : 1;

    if (this.camera.startX <= 0) {
      direction = 1;
    }

    if (direction === -1) {
      entity.x = this.camera.endX + 2;
    } else {
      entity.x = this.camera.startX - 2;
    }

    entity.direction = direction;

    entity.y = this.player.y + getRandomInteger(-2, 2);
  }

  createCollisionMap() {
    var collisionMap = [];

    for (var i = 0; i < this.map.length; i++) {
      var block = this.map[i];

      var flag = 0;

      if (block) {
        var [x, y] = this.convertIndexToCoordinates(i);
        var top = this.map[this.convertCoordinatesToIndex(x, y - 1)];
        var bottom = this.map[this.convertCoordinatesToIndex(x, y + 1)];

        var left = this.map[this.convertCoordinatesToIndex(x - 1, y)];
        var right = this.map[this.convertCoordinatesToIndex(x + 1, y)];

        if (x !== 0) {
          flag |= !left ? 1 : 0;
        }
        if (x !== this.levelWidth - 1) {
          flag |= !right ? 2 : 0;
        }
        if (y !== 0) {
          flag |= !top ? 4 : 0;
        }
        if (y !== this.levelHeight - 1) {
          flag |= !bottom ? 8 : 0;
        }
      }

      collisionMap.push(flag);
    }

    return collisionMap;
  }

  getViewport() {
    return [this.canvas.width, this.canvas.height];
  }

  start() {
    this.inputManager.start();
    this.particleSystem.particles = [];

    this.camera.followingObject = this.player;
  }

  convertIndexToCoordinates(i) {
    return [i % this.levelWidth, Math.floor(i / this.levelWidth)];
  }

  convertCoordinatesToIndex(x, y) {
    return y * this.levelWidth + x;
  }

  renderGame(delta) {
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // var spriteSheet = this.ssm.getSpriteSheet("tile");

    // var sprites = Object.keys(spriteSheet.sprites);

    // var gap = 0.05;

    // var x = this.camera.startX + gap,
    //   y = this.camera.startY + gap;

    // for (var spriteName of sprites) {
    //   var sprite = spriteSheet.sprites[spriteName];

    //   var w = sprite.w / 100;
    //   var h = sprite.h / 100;

    //   this.render.drawRect(x, y, w, h, "#fff");

    //   this.render.drawSprite(
    //     {
    //       sprite: spriteSheet.name,
    //       frame: spriteName,
    //       effects: [],
    //     },
    //     x,
    //     y,
    //     w,
    //     h
    //   );

    //   this.render.drawText(spriteName, x, y + 0.1, "14", "#444499");

    //   x += h + gap;
    //   if (x >= this.camera.getWidth() - gap) {
    //     x = this.camera.startX + gap;
    //     y += h + gap;
    //   }
    // }

    // for (var i = 0; i < 3; i++) {
    //   var pow = ((1 / (4 - i)) * 1) / (4 - i);
    //   var h = this.levelHeight;
    //   var x =
    //     -this.levelHeight +
    //     -this.camera.getCenter()[0] * pow +
    //     this.camera.getCenter()[0];
    //   var w = h / 0.5625;
    //   while (x < this.camera.endX) {
    //     this.render.drawSprite(
    //       {
    //         sprite: "background",
    //         frame: i,
    //       },
    //       x,
    //       this.camera.startY,
    //       w,
    //       h
    //     );
    //     x += w;
    //   }
    // }

    // for (var i = 0; i < this.map.length; i++) {
    //   var block = this.map[i];
    //   if (block) {
    //     var [x, y] = this.convertIndexToCoordinates(i);
    //     // this.render.drawRect(x - 0.01, y - 0.01, 1.02, 1.02, "#333");
    //     this.render.drawSprite(
    //       {
    //         sprite: "tile",
    //         frame: block - 1,
    //         effects: [],
    //       },
    //       x,
    //       y,
    //       1,
    //       1
    //     );
    //   }
    // }

    this.ctx.fillStyle = "#fff";
    this.ctx.font = "20px Readex Pro";
    this.ctx.fillText(this.fps + "", 5, 20);
    this.ctx.font = "14px Readex Pro";

    this.player.render(delta);
    for (var entityUUID in this.entities) {
      var entity = this.entities[entityUUID];

      entity.render(delta);
    }

    for (var i = 0; i < this.map.length; i++) {
      var collisionFlag = this.collisionMap[i];
      var [x, y] = this.convertIndexToCoordinates(i);

      if (
        x + 1 > this.camera.startX &&
        y + 1 > this.camera.startY &&
        x <= this.camera.endX &&
        y <= this.camera.endY
      ) {
        var color = "#fff";

        var width = 0.025;

        if (collisionFlag & 1) {
          this.render.drawRect(x, y, width, 1, color);
          this.render.drawText("1", x + 0.1, y + 0.53, 14);
        }
        if (collisionFlag & 2) {
          this.render.drawRect(x + (1 - width), y, width, 1, color);
          this.render.drawText("2", x + 0.82, y + 0.53, 14);
        }
        if (collisionFlag & 4) {
          this.render.drawRect(x, y, 1, width, color);
          this.render.drawText("4", x + 0.49, y + 0.2, 14);
        }
        if (collisionFlag & 8) {
          this.render.drawRect(x, y + (1 - width), 1, width, color);
          this.render.drawText("8", x + 0.49, y + 0.92, 14);
        }
      }
    }

    var tileKeys = Object.keys(this.player.tiles);
    for (var i = 0; i < tileKeys.length; i++) {
      var tile = tileKeys[i];
      var collisionFlag = this.player.tiles[tile];
      var [x, y] = this.convertIndexToCoordinates(tile);
      if (collisionFlag & 1) {
        this.render.drawRect(x, y, 0.05, 1, "#fff");
      }
      if (collisionFlag & 2) {
        this.render.drawRect(x + 0.95, y, 0.05, 1, "#fff");
      }
      if (collisionFlag & 4) {
        this.render.drawRect(x, y, 1, 0.05, "#fff");
      }
      if (collisionFlag & 8) {
        this.render.drawRect(x, y + 0.95, 1, 0.05, "#fff");
      }
    }

    this.particleSystem.render();
  }

  updateGame(delta) {
    this.fpsTick += delta;
    if (this.fpsTick > 0.5) {
      this.fpsTick = 0;

      this.fps = Math.floor(1 / delta);
    }

    this.spawnTick += delta;
    if (this.spawnTick > 2) {
      this.spawnTick = 0;

      this.spawnEntity();
    }

    this.controller.update(delta);

    var deleteUUIDs = [];

    for (var entityUUID in this.entities) {
      var entity = this.entities[entityUUID];

      entity.update(delta);

      if (entity.delete) {
        deleteUUIDs.push(entityUUID);
      }
    }

    for (var entityUUID of deleteUUIDs) {
      delete this.entities[entityUUID];
    }

    this.player.update(delta);
    this.particleSystem.update(delta);
    this.camera.update(delta);
  }
}

import Game from "./Game.js";
import { degreesToRadians } from "./util/MathUtil.js";

export default class Render {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
  }

  setAlpha(alpha) {
    this.game.ctx.globalAlpha = alpha;
  }

  drawLine(startX, startY, endX, endY, strokeWidth, color) {
    this.game.ctx.strokeStyle = color;

    this.game.ctx.beginPath();
    this.game.ctx.moveTo(
      ...this.game.camera.transformCoordinates(startX, startY)
    );
    this.game.ctx.lineTo(...this.game.camera.transformCoordinates(endX, endY));
    this.game.ctx.lineWidth = this.game.camera.transformX(strokeWidth);

    this.game.ctx.stroke();
    this.game.ctx.closePath();
  }

  drawRect(x, y, w, h, color) {
    this.game.ctx.fillStyle = color;
    this.game.ctx.fillRect(...this.game.camera.transformRect(x, y, w, h));
  }

  drawCircle(x, y, r, color) {
    this.game.ctx.fillStyle = color;
    this.game.ctx.beginPath();
    this.game.ctx.arc(
      ...this.game.camera.transformCoordinates(x, y),
      this.game.camera.transformX(r),
      2 * Math.PI,
      0
    );
    this.game.ctx.fill();
    this.game.ctx.closePath();
  }

  /**
   * @param {Object} spriteInfo
   * @param {string} spriteInfo.sprite
   * @param {number} spriteInfo.frame
   * @param {string[]} spriteInfo.effects
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawSprite(spriteInfo, x, y, w, h) {
    var sprite = this.game.ssm.getSpriteFromInfoObject(spriteInfo);

    if (sprite) {
      this.drawScalingSprite(spriteInfo, x, y, w, h);

      var aspectRatio = sprite.h / sprite.w;
      var passedAspectRatio = h / w;

      if (aspectRatio.toFixed(2) !== passedAspectRatio.toFixed(2)) {
        throw new Error(
          "Invalid aspect ratio while drawing " +
            JSON.stringify(spriteInfo) +
            ", expected: " +
            aspectRatio +
            ", received: " +
            passedAspectRatio
        );
      }
    }
  }

  drawScalingSprite(spriteInfo, x, y, w, h) {
    var sprite = this.game.ssm.getSpriteFromInfoObject(spriteInfo);

    if (sprite) {
      this.drawImage(
        sprite.spriteSheet.image,
        x,
        y,
        w,
        h,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h
      );
    }
  }

  drawImage(img, x, y, w, h, sx, sy, sw, sh) {
    this.game.ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      ...this.game.camera.transformRect(x, y, w, h).map(Math.round)
    );
  }

  drawImageWithRotation(image, _x, _y, _w, _h, sx, sy, sw, sh, rotateDegrees) {
    var [x, y, width, height] = this.game.camera.transformRect(_x, _y, _w, _h);

    x += width / 2;
    y += height / 2;

    var context = this.game.ctx;

    var angleInRadians = degreesToRadians(rotateDegrees);

    context.translate(x, y);
    context.rotate(angleInRadians);
    context.drawImage(
      image,
      sx,
      sy,
      sw,
      sh,
      -width / 2,
      -height / 2,
      width,
      height
    );
    context.rotate(-angleInRadians);
    context.translate(-x, -y);
  }

  drawText(text, x, y, fontSize, color) {
    this.game.ctx.fillStyle = color;
    this.game.ctx.font = fontSize + "px";

    this.game.ctx.fillText(
      text,
      ...this.game.camera.transformCoordinates(x, y)
    );
  }

  drawScalingText(text, x, y, maxX, fontSize, color) {
    this.game.ctx.fillStyle = color;
    this.game.ctx.font = fontSize + "px";

    this.game.ctx.fillText(
      text,
      ...this.game.camera.transformCoordinates(x, y),
      this.game.camera.transformX(maxX)
    );
  }
}

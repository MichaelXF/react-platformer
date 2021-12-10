import SpriteSheet from "./SpriteSheet";

export default class Sprite {
  constructor(spriteInfo, spriteSheet) {
    if (!(spriteSheet instanceof SpriteSheet)) {
      throw new Error("Invalid sprite sheet");
    }

    this.x = spriteInfo.x || 0;
    this.y = spriteInfo.y || 0;
    this.w = spriteInfo.w || 0;
    this.h = spriteInfo.h || 0;

    /**
     * @type {SpriteSheet}
     */
    this.spriteSheet = spriteSheet;
  }
}

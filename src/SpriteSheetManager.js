import Sprite from "./Sprite.js";
import SpriteSheet from "./SpriteSheet.js";

export default class SpriteSheetManager {
  constructor() {
    /**
     * @type {Object.<string, SpriteSheet>}
     */
    this.spriteSheets = {};

    this.assetsLoaded = 0;
    this.assetsTotal = 0;
    this.hasLoaded = false;
    this.onLoaded = () => {};
  }

  incrementLoaded() {
    this.assetsLoaded++;

    console.log(this.assetsLoaded, this.assetsTotal);

    setTimeout(() => {
      if (this.assetsLoaded === this.assetsTotal) {
        if (!this.hasLoaded) {
          this.hasLoaded = true;
          this.onLoaded();
        }
      }
    }, 90);
  }

  addSpriteSheet(name, imgPath, info) {
    var ss = new SpriteSheet(imgPath, info, this);
    ss.name = name;

    if (info.type === "increment_file_name") {
      this.assetsTotal += info.max;
    } else {
      this.assetsTotal += 1;
    }

    this.spriteSheets[name] = ss;
    return ss;
  }

  /**
   * @param {string} spriteSheetName
   * @returns {SpriteSheet}
   */
  getSpriteSheet(spriteSheetName) {
    if (!this.spriteSheets[spriteSheetName]) {
      throw new Error("Invalid sprite sheet: " + spriteSheetName);
    }
    return this.spriteSheets[spriteSheetName];
  }

  /**
   * @param {string} path
   * @returns {Sprite}
   */
  getSprite(path) {
    var spriteSheetName = path.split(":")[0];
    var spriteName = path.split(":")[1];

    return this.getSpriteSheet(spriteSheetName).getSprite(spriteName);
  }

  /**
   * @param {Object} spriteInfo
   * @param {string} spriteInfo.sprite
   * @param {number} spriteInfo.frame
   * @param {string[]} spriteInfo.effects
   * @returns {Sprite}
   */
  getSpriteFromInfoObject(spriteInfo) {
    var sprite = spriteInfo.sprite;
    var frame = spriteInfo.frame;

    var effects = spriteInfo.effects || [];

    var spriteSheet = this.getSpriteSheet(sprite).getEffects(effects);

    if (spriteSheet) {
      return spriteSheet.getSprite(frame);
    } else {
      throw new Error("No sprite sheet");
    }
  }
}

import Sprite from "./Sprite";
import SpriteSheet from "./SpriteSheet";

export default class ImageEffects {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
  }

  async applyEffectsToSpriteSheet(spriteSheet, effects) {
    if (!effects.length) {
      return spriteSheet;
    }

    var images = new Map();
    var firstImage;
    var clonedSprites = {};

    for (var spriteName in spriteSheet.sprites) {
      var sprite = spriteSheet.sprites[spriteName];
      var image = sprite.spriteSheet.image;

      var clonedSprite = new Sprite(sprite, sprite.spriteSheet);
      clonedSprites[spriteName] = clonedSprite;

      if (!firstImage) {
        firstImage = image;
      }

      if (!images.has(image)) {
        images.set(image, [clonedSprite]);
      } else {
        images.get(image).push(clonedSprite);
      }
    }

    var topLevel = new SpriteSheet(
      await this.applyEffectsToImage(firstImage, effects),
      {
        type: "manual",
        sprites: {},
      },
      spriteSheet.ssm,
      false
    );

    topLevel.sprites = clonedSprites;

    for (var image of images.keys()) {
      var sprites = images.get(image);

      var newImage = await this.applyEffectsToImage(image, effects);
      var newSpriteSheet = new SpriteSheet(
        newImage,
        {
          type: "manual",
          sprites: {},
        },
        spriteSheet.ssm,
        false
      );

      newSpriteSheet.sprites = sprites;

      for (var sprite of sprites) {
        sprite.spriteSheet = newSpriteSheet;
      }
    }

    return topLevel;
  }

  async applyEffectsToImage(image, effects) {
    if (!effects.length) {
      return image;
    }

    var currentImage = image;
    for (var effect of effects) {
      currentImage = await this.applyEffectToImage(currentImage, effect);
    }

    return currentImage;
  }

  async applyEffectToImage(image, effect) {
    return new Promise((resolve, reject) => {
      var effectName = typeof effect === "string" ? effect : effect.name;

      // prepare canvas
      this.canvas.width = image.width;
      this.canvas.height = image.height;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      switch (effectName) {
        case "flipHorizontally":
          this.flipHorizontally(image);
          break;

        case "teamColor":
          this.teamColor(image, effect.payload);
          break;

        default:
          throw new Error("Invalid effect name " + effectName);
      }

      let outputImage = new Image();

      var dataURL = this.canvas.toDataURL("image/png");

      outputImage.src = dataURL;
      outputImage.onload = () => {
        outputImage.loaded = true;

        resolve(outputImage);
      };
    });
  }

  teamColor(image, color = "#ff2222") {
    var ctx = this.ctx,
      canvas = this.canvas;

    if (Array.isArray(color)) {
      color = "rgb(" + color.join(",") + ")";
    }
    /// ... var color = colors[index];

    this.canvas.width = image.width;
    this.canvas.height = image.height;

    // First draw your image to the buffer
    ctx.drawImage(image, 0, 0);

    // Now we'll multiply a rectangle of your chosen color

    ctx.globalCompositeOperation = "darken";

    ctx.fillStyle = color;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Finally, fix masking issues you'll probably incur and optional globalAlpha
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, 0, 0);
  }

  /**
   * @param {Image} image
   */
  flipHorizontally(image) {
    this.canvas.width = image.width;
    this.canvas.height = image.height;

    const flipHorizontally = (img, x, y) => {
      // move to x + img's width
      this.ctx.translate(x + img.width, y);

      // scaleX by -1; this "trick" flips horizontally
      this.ctx.scale(-1, 1);

      // draw the img
      // no need for x,y since we've already translated
      this.ctx.drawImage(img, 0, 0);

      // always clean up -- reset transformations to default
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    flipHorizontally(image, 0, 0);
  }
}

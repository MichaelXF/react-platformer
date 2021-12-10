import ImageEffects from "./ImageEffects";
import Sprite from "./Sprite";
import SpriteSheetManager from "./SpriteSheetManager";

const SPRITE_PATH = process.env.PUBLIC_URL + "/sprites/";

export default class SpriteSheet {
  constructor(imgPath, info, spriteSheetManager, isTopLevel = true) {
    if (
      !spriteSheetManager ||
      !(spriteSheetManager instanceof SpriteSheetManager)
    ) {
      throw new Error("Invalid spriteSheetManager");
    }

    /**
     * @type {Object.<string, Sprite>}
     */
    this.sprites = {};
    this.ssm = spriteSheetManager;
    this.effectsCache = {};
    this.creating = {};

    this.name = "";

    this.image = imgPath instanceof Image ? imgPath : new Image();

    if (typeof imgPath === "string") {
      this.image.src = SPRITE_PATH + imgPath;
    }

    this.image.addEventListener("error", (e) => {
      console.log("Error loading " + this.image.src, e);
    });

    this.image.addEventListener("load", () => {
      this.image.loaded = true;
      if (isTopLevel) {
        this.ssm.incrementLoaded();
      }

      if (info.type === "auto") {
        if (!info.width || !info.height) {
          throw new Error(
            "Invalid width/height on info " + JSON.stringify(info)
          );
        }

        var width = info.width;
        var height = info.height;

        var border = info.border || 0;

        var imageWidth = this.image.width - border * 2;
        var imageHeight = this.image.height - border * 2;

        if (width > imageWidth) {
          throw new Error(
            imgPath +
              " invalid sprite width " +
              width +
              " when image is " +
              imageWidth +
              "px wide"
          );
        }

        if (height > imageHeight) {
          throw new Error(
            imgPath +
              " invalid sprite height " +
              width +
              " when image is " +
              imageHeight +
              "px tall"
          );
        }

        var x = 0;
        var y = 0;
        var i = 0;
        while (true) {
          this.sprites[i] = new Sprite(
            {
              x: x,
              y: y,
              w: width,
              h: height,
            },
            this
          );

          i++;
          x += width;
          if (x >= imageWidth) {
            x = border;
            y += height;
          }

          if (y >= imageHeight) {
            break;
          }
        }
      } else if (info.type === "manual") {
        if (!info.sprites) {
          throw new Error("Invalid sprites on info " + JSON.stringify(info));
        }

        var sprites = info.sprites;
        for (var spriteName in sprites) {
          this.sprites[spriteName] = new Sprite(sprites[spriteName], this);
        }
      } else if (info.type === "increment_file_name") {
        var prefix = imgPath.split("1.png")[0];
        var suffix = ".png";

        if (!imgPath.includes("1.png")) {
          throw new Error("Invalid path");
        }

        this.sprites[0] = new Sprite(
          {
            x: 0,
            y: 0,
            w: this.image.width,
            h: this.image.height,
          },
          this
        );

        for (var i = 2; i <= info.max; i++) {
          ((i) => {
            // Placeholder sprite while it loads

            var newImageSRC = prefix + i + suffix;

            var childSprite = new Sprite(
              {
                x: 0,
                y: 0,
                w: this.image.width,
                h: this.image.height,
              },
              new SpriteSheet(
                newImageSRC,
                {
                  type: "single",
                },
                this.ssm
              )
            );

            childSprite.indirect = true;

            this.sprites[i - 1] = childSprite;
          })(i);
        }
      } else if (info.type === "single") {
        this.sprites = {
          0: new Sprite(
            {
              x: 0,
              y: 0,
              w: this.image.width,
              h: this.image.height,
            },
            this
          ),
        };
      }
    });
  }

  /**
   * @param {string} spriteName
   * @returns {Sprite}
   */
  getSprite(spriteName) {
    var sprite = this.sprites[spriteName];
    if (!sprite) {
      throw new Error(
        "Invalid sprite: " +
          spriteName +
          " (" +
          this.name +
          ") [" +
          Object.keys(this.sprites).join(",") +
          "]"
      );
    }

    return sprite;
  }

  getEffects(effects) {
    if (!effects.length) {
      return this;
    }

    var name = JSON.stringify(effects);

    if (this.effectsCache[name]) {
      return this.effectsCache[name];
    }
    if (this.creating[name]) {
      return this;
    }

    this.creating[name] = true;

    (async () => {
      var imageEffects = new ImageEffects();
      var newSpriteSheet = await imageEffects.applyEffectsToSpriteSheet(
        this,
        effects
      );

      if (!(newSpriteSheet instanceof SpriteSheet)) {
        throw new Error("Expected SpriteSheet");
      }

      this.effectsCache[name] = newSpriteSheet;
      this.creating[name] = false;
    })();

    return this;
  }
}

import { useEffect, useRef, useState } from "react";
import Game from "./Game";
import SpriteSheets from "./data/SpriteSheets";
import SpriteSheetManager from "./SpriteSheetManager";
import SpriteSheet from "./SpriteSheet";

function App() {
  var canvasRef = useRef();

  /**
   * Show menu
   */
  var [menu, setMenu] = useState(false);
  var gameRef = useRef();

  useEffect(() => {
    var ssm = new SpriteSheetManager();

    Object.keys(SpriteSheets).forEach((spriteSheetName) => {
      var data = SpriteSheets[spriteSheetName];
      ssm.addSpriteSheet(spriteSheetName, data.imgPath, data);
    });

    /**
     * @type {HTMLCanvasElement}
     */
    var canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    /**
     * @type {CanvasRenderingContext2D}
     */
    var ctx = canvas.getContext("2d");

    var last = performance.now();

    var game = new Game(canvas, ctx, ssm);
    gameRef.current = game;

    window.game = game;

    var cb = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";

      game.camera.updateAspectRatio();
    };
    cb();
    var active = true;
    game.active = true;

    function update() {
      var now = performance.now();
      var delta = (now - last) / 1000;
      last = now;

      if (delta > 0.25) {
        delta = 0.25;
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (game.active) {
        game.updateGame(delta);
      }
      game.renderGame(delta);

      active && requestAnimationFrame(update);
    }

    ssm.onLoaded = () => {
      Object.keys(ssm.spriteSheets).forEach((key) => {
        if (key.includes("player_")) {
          ssm.spriteSheets[key].getEffects(["flipHorizontally"]);
        }
      });

      update();

      setTimeout(() => {
        game.start();
        // setMenu(true);
      }, 100);
    };

    window.addEventListener("resize", cb);

    return () => {
      cancelAnimationFrame(update);
      window.removeEventListener("resize", cb);

      active = false;

      game.end();
    };
  }, []);

  return (
    <div className={!menu ? "hide-cursor" : ""}>
      <div className={"main-menu" + (menu ? " main-menu-show" : "")}>
        <h1>Platformer</h1>
        <p>by: MichaelXF</p>

        <button
          className='main-btn'
          onClick={() => {
            // Start game
            setMenu(false);
          }}
        >
          Play
        </button>
      </div>

      <canvas ref={canvasRef} />

      <div className='controls'>
        <kbd>W</kbd>
        <kbd>A</kbd>
        <kbd>S</kbd>
        <kbd>D</kbd>
      </div>
    </div>
  );
}

export default App;

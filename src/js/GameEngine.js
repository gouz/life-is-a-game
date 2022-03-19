import config from "../json/config.json";
import items from "../json/items.json";
import levels from "../json/levels.json";
import Loader from "./Loader";
import Background from "./Background";
import Player from "./Player";

export default class GameEngine {
  constructor(startLevel) {
    this._loader = new Loader(items.list, config.ratio);
    this._background = new Background(config.HTMLElements.background);
    this._player = new Player(
      config.HTMLElements.player,
      config.player.src,
      "SE"
    );
    this._drawLevel(startLevel);
  }
  _drawLevel(level) {
    this._level = level;
    this._loader.prepare().then(() => {
      levels[this._level].background.forEach((row, y) => {
        row.forEach((col, x) => {
          this._background.drawImage(this._loader.fetchImg(col), x, y);
        });
      });
      this._player.drawImage(
        this._loader.fetchImg(this._player.getImage()),
        config.player.initialX,
        config.player.initialY
      );
    });
  }
}

import config from "../json/config.json";
import items from "../json/items.json";
import levels from "../json/levels.json";
import Loader from "./Loader";
import Background from "./Background";
import Player from "./Player";
import "./Keyboard.js";

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
    this._avatarPosX = 0;
    this._avatarPosY = 0;
    this._nbRow = 0;
    this._nbCol = 0;
  }
  _drawLevel(level) {
    this._level = level;
    this._loader.prepare().then(() => {
      levels[this._level].background.forEach((row, y) => {
        let nbColTemp = 0;
        row.forEach((col, x) => {
          this._background.drawImage(this._loader.fetchImg(col), x, y);
          nbColTemp++;
        });
        if (nbColTemp > this._nbCol) this._nbCol = nbColTemp;
        this._nbRow++;
      });
      this._nbCol -= 1;
      this._nbRow -= 1;
      this._player.drawImage(
        this._loader.fetchImg(this._player.getImage()),
        config.player.initialX,
        config.player.initialY
      );
      this._avatarPosX = config.player.initialX;
      this._avatarPosY = config.player.initialY;
    });
  }
  moveAvatar(direction) {
    this._player.setOrientation(direction);
    switch (direction) {
      case "SE":
        this._avatarPosX += 1;
        break;
      case "SW":
        this._avatarPosY += 1;
        break;
      case "NE":
        this._avatarPosY -= 1;
        break;
      case "NW":
        this._avatarPosX -= 1;
        break;
      default:
        break;
    }
    if (this._avatarPosX <= 0) this._avatarPosX = 0;
    if (this._avatarPosY <= 0) this._avatarPosY = 0;
    if (this._avatarPosX >= this._nbCol) this._avatarPosX = this._nbCol;
    if (this._avatarPosY >= this._nbRow) this._avatarPosY = this._nbRow;
    this._player.clean();
    this._player.drawImage(
      this._loader.fetchImg(this._player.getImage()),
      this._avatarPosX,
      this._avatarPosY
    );
  }
}

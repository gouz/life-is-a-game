import config from "../json/config.json";
import items from "../json/items.json";
import levels from "../json/levels.json";
import Loader from "./Loader";
import Decor from "./Decor";
import Player from "./Player";
import "./Keyboard.js";
import GamePad from "./Gamepad";

export default class GameEngine {
  constructor(startLevel) {
    this._loader = new Loader(items.list, config.ratio);
    this._background = new Decor(config.HTMLElements.background);
    this._foreground = new Decor(config.HTMLElements.foreground);
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
    this._gamepad = new GamePad();
  }
  _drawBackground() {
    levels[this._level].background.forEach((row, y) => {
      row.forEach((step, z) => {
        let nbColTemp = 0;
        step.forEach((col, x) => {
          this._background.drawImage(this._loader.fetchImg(col), x, y, z);
          nbColTemp++;
        });
        if (nbColTemp > this._nbCol) this._nbCol = nbColTemp;
      });
      this._nbRow++;
    });
    this._nbCol -= 1;
    this._nbRow -= 1;
    levels[this._level].elements_back.forEach((row, y) => {
      row.forEach((step, z) => {
        step.forEach((col, x) => {
          if ("" != col)
            this._background.drawImage(this._loader.fetchImg(col), x, y, z + 1);
        });
      });
    });
  }
  _drawForeground() {
    levels[this._level].elements_front.forEach((row, y) => {
      row.forEach((step, z) => {
        step.forEach((col, x) => {
          if ("" != col)
            this._foreground.drawImage(this._loader.fetchImg(col), x, y, z + 1);
        });
      });
    });
  }
  _drawPlayer(posX, posY) {
    this._player.clean();
    this._player.drawImage(
      this._loader.fetchImg(this._player.getImage()),
      posX,
      posY
    );
  }
  _drawLevel(level) {
    this._level = level;
    this._loader.prepare().then(() => {
      this._drawBackground();
      this._drawForeground();
      this._drawPlayer(config.player.initialX, config.player.initialY);
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
    this._drawPlayer(this._avatarPosX, this._avatarPosY);
  }
}

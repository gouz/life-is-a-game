import config from "../json/config.json";
import items from "../json/items.json";
// import levels from "../json/levels.json";
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
    this._collisionMap = [];
  }
  _drawDecors(drawing) {
    this._collisionMap = [];
    for (const [key, value] of Object.entries(drawing)) {
      const [x, y, z] = key.split("_").map((e) => {
        return parseInt(e);
      });
      if (x > this._nbCol) this._nbCol = x;
      if (y > this._nbRow) this._nbRow = y;
      // ground
      if (value.ground)
        this._background.drawImage(
          this._loader.fetchImg(value.ground),
          x,
          y,
          z
        );
      // backgrounds
      value.backgrounds.forEach((item) => {
        this._background.drawImage(this._loader.fetchImg(item), x, y, z + 1);
      });
      // foregrounds
      value.foregrounds.forEach((item) => {
        this._foreground.drawImage(this._loader.fetchImg(item), x, y, z + 1);
      });
      // collision ?
      if (value.collision) this._collisionMap.push(key);
    }
  }
  _drawPlayer(posX, posY) {
    this._avatarPosX = posX;
    this._avatarPosY = posY;
    this._player.clean();
    this._player.drawImage(
      this._loader.fetchImg(this._player.getImage()),
      posX,
      posY
    );
  }
  _drawLevel(level) {
    this._level = level;
    fetch(`/json/levels/${level}.json`)
      .then((response) => {
        return response.json();
      })
      .then((drawing) => {
        this._loader.prepare().then(() => {
          this._drawDecors(drawing.drawings);
          this._drawPlayer(config.player.initialX, config.player.initialY);
        });
      });
  }
  moveAvatar(direction) {
    this._player.setOrientation(direction);
    let newX = this._avatarPosX,
      newY = this._avatarPosY,
      newZ = 0;
    switch (direction) {
      case "SE":
        newX++;
        break;
      case "SW":
        newY++;
        break;
      case "NE":
        newY--;
        break;
      case "NW":
        newX--;
        break;
      default:
        break;
    }
    if (newX <= 0) newX = 0;
    if (newY <= 0) newY = 0;
    if (newX >= this._nbCol) newX = this._nbCol;
    if (newY >= this._nbRow) newY = this._nbRow;
    if (this._collisionMap.indexOf(`${newX}_${newY}_${newZ}`) != -1) {
      newX = this._avatarPosX;
      newY = this._avatarPosY;
    }
    this._drawPlayer(newX, newY);
  }
}

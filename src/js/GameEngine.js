import config from "../json/config.json";
import Loader from "./Loader";
import Decor from "./Decor";
import Player from "./Player";
import "./Keyboard.js";
import GamePad from "./Gamepad";

export default class GameEngine {
  constructor(configuration) {
    fetch(`/json/items.json`)
      .then((response) => {
        return response.json();
      })
      .then((items) => {
        this._loader = new Loader(items.list, config.ratio);
        fetch(`/json/levels.json`)
          .then((response) => {
            return response.json();
          })
          .then((levels) => {
            this._levels = levels;
            this._background = new Decor(config.HTMLElements.background);
            this._foreground = new Decor(config.HTMLElements.foreground);
            this._player = new Player(
              config.HTMLElements.player,
              configuration.avatar.img,
              "SE"
            );
            this._drawLevel(configuration.start.level);
            this._avatarPosX = configuration.start.avatar.x;
            this._avatarPosY = configuration.start.avatar.y;
            this._maxRow = 0;
            this._maxCol = 0;
            this._gamepad = new GamePad();
            this._collisionMap = [];
          });
      });
  }
  _drawDecors(drawing) {
    this._collisionMap = [];
    this._background.clean();
    this._foreground.clean();
    for (const [key, value] of Object.entries(drawing)) {
      const [x, y, z] = key.split("_").map((e) => {
        return parseInt(e);
      });
      if (x > this._maxCol) this._maxCol = x;
      if (y > this._maxRow) this._maxRow = y;
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
          this._drawPlayer(this._avatarPosX, this._avatarPosY);
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
    if (newX < 0) {
      if (this._levels[this._level].west) {
        this._avatarPosX = this._maxCol;
        this._drawLevel(this._levels[this._level].west);
        return;
      } else {
        newX = 0;
      }
    }
    if (newX > this._maxCol) {
      if (this._levels[this._level].east) {
        this._avatarPosX = 0;
        this._drawLevel(this._levels[this._level].east);
        return;
      } else {
        newX = this._maxCol;
      }
    }
    if (newY < 0) {
      if (this._levels[this._level].north) {
        this._avatarPosY = this._maxRow;
        this._drawLevel(this._levels[this._level].north);
        return;
      } else {
        newY = 0;
      }
    }
    if (newY > this._maxRow) {
      if (this._levels[this._level].south) {
        this._avatarPosY = 0;
        this._drawLevel(this._levels[this._level].south);
        return;
      } else {
        newY = this._maxRow;
      }
    }
    if (this._collisionMap.indexOf(`${newX}_${newY}_${newZ}`) != -1) {
      newX = this._avatarPosX;
      newY = this._avatarPosY;
    }
    this._drawPlayer(newX, newY);
  }
}

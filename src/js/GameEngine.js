import config from "../json/config.json";
import Loader from "./Loader";
import Decor from "./Decor";
import Player from "./Player";
import "./Keyboard.js";
import GamePad from "./Gamepad";

export default class GameEngine {
  constructor(configuration) {
    const canvasWrapper = document.getElementById("canvas-wrapper");
    canvasWrapper.style.width = config.board.width + "px";
    canvasWrapper.style.height = config.board.height + "px";
    this._titleElement = document.getElementById(config.HTMLElements.title);
    this._loader = new Loader();
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
        let avatars = ["NW", "NE", "SW", "SE"];
        avatars = avatars.map((a) => {
          return {
            src: `${configuration.avatar.img}_${a}`,
            ratio: config.ratio,
          };
        });
        this._loader.prepare(avatars).then(() => {
          this._drawLevel(configuration.start.level);
          this._avatarPosX = configuration.start.avatar.x;
          this._avatarPosY = configuration.start.avatar.y;
          this._gamepad = new GamePad();
          this._collisionMap = [];
        });
      });
  }
  _drawDecors(drawing, collisions) {
    this._collisionMap = [];
    this._background.clean();
    this._foreground.clean();
    this._maxRow = 0;
    this._maxCol = 0;
    for (const [key, value] of Object.entries(drawing)) {
      // ground
      value.ground?.forEach((coord) => {
        if (
          ("" + coord[0]).indexOf("..") != -1 ||
          ("" + coord[1]).indexOf("..") != -1
        ) {
          // math notation
          let boundingbox = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
          };
          if (("" + coord[0]).indexOf("..") != -1) {
            [boundingbox.x.min, boundingbox.x.max] = coord[0].split("..");
          } else {
            boundingbox.x.min = coord[0];
            boundingbox.x.max = coord[0];
          }
          if (("" + coord[1]).indexOf("..") != -1) {
            [boundingbox.y.min, boundingbox.y.max] = coord[1].split("..");
          } else {
            boundingbox.y.min = coord[1];
            boundingbox.y.max = coord[1];
          }
          boundingbox.x.min = parseInt(boundingbox.x.min);
          boundingbox.x.max = parseInt(boundingbox.x.max);
          boundingbox.y.min = parseInt(boundingbox.y.min);
          boundingbox.y.max = parseInt(boundingbox.y.max);
          for (let x = boundingbox.x.min; x <= boundingbox.x.max; x++) {
            for (let y = boundingbox.y.min; y <= boundingbox.y.max; y++) {
              this._background.drawImage(
                this._loader.fetchImg(key),
                parseInt(x),
                parseInt(y),
                coord[2]
              );
            }
          }
          if (boundingbox.x.max > this._maxCol)
            this._maxCol = boundingbox.x.max;
          if (boundingbox.y.max > this._maxRow)
            this._maxRow = boundingbox.y.max;
        } else {
          coord = coord.map((v) => {
            return parseInt(v);
          });
          if (coord[0] > this._maxCol) this._maxCol = coord[0];
          if (coord[1] > this._maxRow) this._maxRow = coord[1];
          this._background.drawImage(
            this._loader.fetchImg(key),
            coord[0],
            coord[1],
            coord[2]
          );
        }
      });
      // backgrounds
      value.background?.forEach((coord) => {
        this._background.drawImage(
          this._loader.fetchImg(key),
          coord[0],
          coord[1],
          coord[2] + 1,
          value.ratio,
          value.shiftX,
          value.shiftY
        );
      });
      // foregrounds
      value.foreground?.forEach((coord) => {
        this._foreground.drawImage(
          this._loader.fetchImg(key),
          coord[0],
          coord[1],
          coord[2] + 1,
          value.ratio,
          value.shiftX,
          value.shiftY
        );
      });
      collisions?.forEach((coord) => {
        this._collisionMap.push(coord.join("_"));
      });
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
    this._titleElement.innerText = this._level;
    fetch(`/json/levels/${level}.json`)
      .then((response) => {
        return response.json();
      })
      .then((drawing) => {
        let objectsToLoad = [];
        for (const [key, value] of Object.entries(drawing.drawings))
          objectsToLoad.push({
            src: key,
            ratio: (value.ratio ? value.ratio : 1) * config.ratio,
          });
        this._loader.prepare(objectsToLoad).then(() => {
          this._drawDecors(drawing.drawings, drawing.collisions);
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

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
          configuration.start.avatar.direction
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
          this._treasureMap = [];
          this._items = [];
        });
      });
  }
  _loopDraw(
    destination,
    coord,
    image,
    calcBounding = false,
    ratio = 1,
    shiftX = 0,
    shiftY = 0,
    shiftZ = 0
  ) {
    if (("" + coord[0]).includes("..") || ("" + coord[1]).includes("..")) {
      // math notation
      let boundingbox = {
        x: { min: 0, max: 0, step: 1 },
        y: { min: 0, max: 0, step: 1 },
      };

      if (("" + coord[0]).includes("..")) {
        [boundingbox.x.min, boundingbox.x.max] = coord[0].split("..");
        if (boundingbox.x.max.includes("|")) {
          [boundingbox.x.max, boundingbox.x.step] =
            boundingbox.x.max.split("|");
        }
      } else {
        boundingbox.x.min = coord[0];
        boundingbox.x.max = coord[0];
      }
      if (("" + coord[1]).includes("..")) {
        [boundingbox.y.min, boundingbox.y.max] = coord[1].split("..");
        if (boundingbox.y.max.includes("|")) {
          [boundingbox.y.max, boundingbox.y.step] =
            boundingbox.y.max.split("|");
        }
      } else {
        boundingbox.y.min = coord[1];
        boundingbox.y.max = coord[1];
      }
      boundingbox.x.min = parseInt(boundingbox.x.min);
      boundingbox.x.max = parseInt(boundingbox.x.max);
      boundingbox.x.step = parseInt(boundingbox.x.step);
      boundingbox.y.min = parseInt(boundingbox.y.min);
      boundingbox.y.max = parseInt(boundingbox.y.max);
      boundingbox.y.step = parseInt(boundingbox.y.step);
      for (
        let x = boundingbox.x.min;
        x <= boundingbox.x.max;
        x += boundingbox.x.step
      ) {
        for (
          let y = boundingbox.y.min;
          y <= boundingbox.y.max;
          y += boundingbox.y.step
        ) {
          destination.drawImage(
            this._loader.fetchImg(image, ratio * config.ratio),
            parseInt(x),
            parseInt(y),
            parseInt(coord[2]) + parseInt(shiftZ),
            ratio,
            shiftX,
            shiftY
          );
        }
      }
      if (calcBounding) {
        if (boundingbox.x.max > this._maxCol) this._maxCol = boundingbox.x.max;
        if (boundingbox.y.max > this._maxRow) this._maxRow = boundingbox.y.max;
      }
    } else {
      coord = coord.map((v) => {
        return parseInt(v);
      });
      if (calcBounding) {
        if (coord[0] > this._maxCol) this._maxCol = coord[0];
        if (coord[1] > this._maxRow) this._maxRow = coord[1];
      }
      destination.drawImage(
        this._loader.fetchImg(image, ratio * config.ratio),
        parseInt(coord[0]),
        parseInt(coord[1]),
        parseInt(coord[2]) + parseInt(shiftZ),
        ratio,
        shiftX,
        shiftY
      );
    }
  }
  _drawDecors(drawing, collisions, treasures) {
    this._maxRow = 0;
    this._maxCol = 0;
    for (let i = 0; i <= this._maxZIndex; i++) {
      for (const [image, value] of Object.entries(drawing)) {
        // ground
        value.ground?.forEach((coord) => {
          if (0 == i) this._loopDraw(this._background, coord, image, true);
        });
        // backgrounds
        value.background?.forEach((coord) => {
          if (
            (0 == i && typeof value["z-index"] == "undefined") ||
            i == value["z-index"]
          )
            this._loopDraw(
              this._background,
              coord,
              image,
              false,
              value.ratio,
              value.shiftX,
              value.shiftY,
              1
            );
        });
        // foregrounds
        value.foreground?.forEach((coord) => {
          if (
            (0 == i && typeof value["z-index"] == "undefined") ||
            i == value["z-index"]
          )
            this._loopDraw(
              this._foreground,
              coord,
              image,
              false,
              value.ratio,
              value.shiftX,
              value.shiftY,
              1
            );
        });
      }
    }
    collisions?.forEach((coord) => {
      if (("" + coord[0]).includes("..") || ("" + coord[1]).includes("..")) {
        // math notation
        let boundingbox = {
          x: { min: 0, max: 0 },
          y: { min: 0, max: 0 },
        };
        if (("" + coord[0]).includes("..")) {
          [boundingbox.x.min, boundingbox.x.max] = coord[0].split("..");
        } else {
          boundingbox.x.min = coord[0];
          boundingbox.x.max = coord[0];
        }
        if (("" + coord[1]).includes("..")) {
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
            this._collisionMap.push([x, y, parseInt(coord[2])].join("_"));
          }
        }
      } else {
        this._collisionMap.push(coord.join("_"));
      }
    });
    treasures?.forEach((treasure) => {
      const coord = treasure.coord.join("_");
      this._treasureMap.push(coord);
      this._items[coord] = treasure.item;
    });
  }
  _drawPlayer(posX, posY) {
    this._avatarPosX = posX;
    this._avatarPosY = posY;
    this._player.clean();
    this._player.drawImage(
      this._loader.fetchImg(this._player.getImage(), config.ratio),
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
        this._maxZIndex = 0;
        for (const [key, value] of Object.entries(drawing.drawings)) {
          objectsToLoad.push({
            src: key,
            ratio: (value.ratio ? value.ratio : 1) * config.ratio,
          });
          if (value["z-index"] && value["z-index"] > this._maxZIndex) {
            this._maxZIndex = parseInt(value["z-index"]);
          }
        }
        this._loader.prepare(objectsToLoad).then(() => {
          this._background.clean();
          this._foreground.clean();
          this._collisionMap = [];
          this._treasureMap = [];
          this._items = [];
          this._drawDecors(
            drawing.drawings,
            drawing.collisions,
            drawing.treasures
          );
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
    if (this._collisionMap.includes(`${newX}_${newY}_${newZ}`)) {
      newX = this._avatarPosX;
      newY = this._avatarPosY;
    }
    this._drawPlayer(newX, newY);
  }
  canOpenTreasureOrDoor() {
    let newX = this._avatarPosX;
    let newY = this._avatarPosY;
    switch (this._player.getOrientation()) {
      case "NW":
        newX--;
        break;
      case "NE":
        newY--;
        break;
      case "SE":
        newX++;
        break;
      case "SW":
        newY++;
        break;
      default:
        break;
    }
    const pos = [newX, newY, 0].join("_");
    console.log(pos, this._treasureMap);
    if (this._treasureMap.includes(pos)) {
      // 🎉 where is a treasure !!!
      alert(this._items[pos]);
    } else {
      alert("Nothing to do!");
    }
  }
}

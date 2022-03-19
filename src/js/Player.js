import config from "../json/config.json";
import CanvasDrawer from "./CanvasDrawer";

export default class Player extends CanvasDrawer {
  constructor(elementId, imageSrc, orientation) {
    super(elementId);
    this._src = imageSrc;
    this._orientation = orientation;

    this._customShiftY = config.player.shiftY;
  }

  getImage() {
    return `${this._src}_${this._orientation}`;
  }
}

import config from "../json/config.json";
import CanvasDrawer from "./CanvasDrawer";

export default class Player extends CanvasDrawer {
  constructor(elementId, imageSrc, orientation) {
    super(elementId);
    this._src = imageSrc;
    this._orientation = orientation;
    this._items = [];

    this._customShiftY = config.player.shiftY;
  }

  getImage() {
    return `${this._src}_${this._orientation}`;
  }

  setOrientation(orientation) {
    this._orientation = orientation;
  }

  getOrientation() {
    return this._orientation;
  }

  addItem(item) {
    this._items.push(item);
  }

  owns(item) {
    return this._items.includes(item);
  }
}

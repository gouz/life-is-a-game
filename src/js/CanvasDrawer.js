import config from "../json/config.json";

export default class CanvasDrawer {
  constructor(elementId) {
    const $bb = document.getElementById(elementId);
    this._width = config.board.width;
    this._height = config.board.height;
    $bb.width = this._width;
    $bb.height = this._height;
    this._ctx = $bb.getContext("2d");

    this._side = config.dimensions.items.width * config.ratio;
    this._shift = (config.dimensions.items.width / 2) * config.ratio;

    this._customShiftX = 0;
    this._customShiftY = 0;
  }

  drawImage(image, posX, posY, posZ = 0, ratio = 1, shiftX = 0, shiftY = 0) {
    console.log(this._size);
    const x =
      (posX - posY) * this._side -
      config.dimensions.items.shiftX * config.ratio +
      this._width / 2 -
      this._customShiftX * this._side * config.ratio;
    const y =
      (posX + posY) * this._shift -
      config.dimensions.items.shiftY * config.ratio +
      this._shift +
      this._customShiftY * this._side * config.ratio -
      posZ * config.dimensions.items.shiftZ * config.ratio -
      ((ratio - 1) * this._side) / 2;
    this._ctx.drawImage(image, x, y);
  }

  clean() {
    this._ctx.clearRect(0, 0, this._width, this._height);
  }
}

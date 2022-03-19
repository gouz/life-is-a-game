import config from "../json/config.json";

export default class CanvasDrawer {
  constructor(elementId) {
    const $bb = document.getElementById(elementId);
    this._width = config.board.width;
    this._heigth = config.board.height;
    $bb.width = this._width;
    $bb.height = this._heigth;
    this._ctx = $bb.getContext("2d");

    this._newX = config.dimensions.items.width * config.ratio;
    this._shift = (config.dimensions.items.width / 2) * config.ratio;

    this._customShiftX = 0;
    this._customShiftY = 0;
  }

  drawImage(image, posX, posY, posZ = 0) {
    this._ctx.drawImage(
      image,
      (posX - posY) * this._newX -
        config.dimensions.items.shiftX * config.ratio +
        this._width / 2 -
        this._newX +
        this._customShiftX * this._newX * config.ratio,
      (posX + posY) * this._shift -
        config.dimensions.items.shiftY * config.ratio +
        this._shift +
        this._customShiftY * this._newX * config.ratio -
        posZ * config.dimensions.items.shiftZ * config.ratio
    );
  }

  clean() {
    this._ctx.clearRect(0, 0, this._width, this._heigth);
  }
}

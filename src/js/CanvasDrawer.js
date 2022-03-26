import config from "../json/config.json";

export default class CanvasDrawer {
  constructor(elementId) {
    const $bb = document.getElementById(elementId);
    this._width = config.board.width;
    this._height = config.board.height;
    $bb.width = this._width;
    $bb.height = this._height;
    this._ctx = $bb.getContext("2d");

    this._side = config.dimensions.items.width;

    this._customShiftX = 0;
    this._customShiftY = 0;
  }

  drawImage(image, posX, posY, posZ = 0, ratio = 1, shiftX = 0, shiftY = 0) {
    // default calculus
    let x = (posX - posY) * this._side;
    let y = ((posX + posY) * this._side) / 2;
    // remove blank
    x -= config.dimensions.items.shiftX * ratio;
    y -= config.dimensions.items.shiftY * ratio;
    // we center the top left corner
    x += this._width / (2 * config.ratio);
    // we shift the element to match its correct place
    x += this._side * this._customShiftX;
    y += this._side * this._customShiftY;
    // we shift the element to match its correct place through the configuration
    x += this._side * shiftX;
    y += this._side * shiftY;
    // we manage the Z position
    y -= posZ * this._side * 1.25;
    // we shift the Y pos which allows to draw an avatar on the top left corner
    y += this._side / 2;

    this._ctx.drawImage(image, x * config.ratio, y * config.ratio);
  }

  clean() {
    this._ctx.clearRect(0, 0, this._width, this._height);
  }
}

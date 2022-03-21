export default class Loader {
  constructor(aItems, ratio) {
    this._aItems = aItems;
    this._aCanvas = {};
    this._ratio = ratio;
  }

  _loadImg(src) {
    return new Promise((resolve) => {
      if (Object.keys(this._aCanvas).indexOf(src) != -1) resolve();
      const img = new Image();
      img.onload = () => {
        const oc = document.createElement("canvas");
        const octx = oc.getContext("2d");
        oc.width = img.width * this._ratio;
        oc.height = img.height * this._ratio;
        octx.drawImage(img, 0, 0, oc.width, oc.height);
        this._aCanvas[src] = oc;
        resolve();
      };
      img.src = `/img/${src}.png`;
    });
  }

  prepare() {
    let promises = [];
    this._aItems.forEach((imageSrc) => {
      promises.push(this._loadImg(imageSrc));
    });
    return Promise.all(promises);
  }

  fetchImg(src) {
    return this._aCanvas[src];
  }
}

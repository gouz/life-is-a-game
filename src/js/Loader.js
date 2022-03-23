export default class Loader {
  constructor() {
    this._aCanvas = {};
  }

  _loadImg(src, ratio) {
    return new Promise((resolve) => {
      if (Object.keys(this._aCanvas).indexOf(src) != -1) resolve();
      const img = new Image();
      img.onload = () => {
        const oc = document.createElement("canvas");
        const octx = oc.getContext("2d");
        oc.width = img.width * ratio;
        oc.height = img.height * ratio;
        octx.drawImage(img, 0, 0, oc.width, oc.height);
        this._aCanvas[src] = oc;
        resolve();
      };
      img.src = `/img/${src}.png`;
    });
  }

  prepare(aItems) {
    let promises = [];
    aItems.forEach((imageSrcRatio) => {
      promises.push(this._loadImg(imageSrcRatio.src, imageSrcRatio.ratio));
    });
    return Promise.all(promises);
  }

  fetchImg(src) {
    return this._aCanvas[src];
  }
}

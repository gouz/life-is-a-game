export default class Loader {
  constructor() {
    this._aCanvas = {};
  }

  _normalizeName(src, ratio) {
    return `${src}::${ratio}`;
  }

  _loadImg(src, ratio = 1) {
    return new Promise((resolve) => {
      const name = this._normalizeName(src, ratio);
      if (Object.keys(this._aCanvas).includes(name)) resolve();
      const img = new Image();
      img.onload = () => {
        const oc = document.createElement("canvas");
        const octx = oc.getContext("2d");
        oc.width = img.width * ratio;
        oc.height = img.height * ratio;
        octx.drawImage(img, 0, 0, oc.width, oc.height);
        this._aCanvas[name] = oc;
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

  fetchImg(src, ratio = 1) {
    return this._aCanvas[this._normalizeName(src, ratio)];
  }
}

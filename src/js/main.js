import "../less/main.less";

const $bb = document.getElementById("board-background");
$bb.width = 800;
$bb.height = 800;

const ctx = $bb.getContext("2d");

let canvasStack = {};

const RATIO = 1;

const newX = 64 * RATIO;
const stepY = 32 * RATIO;
const newY = 111 * RATIO;

const loadImg = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = (e) => {
      const oc = document.createElement("canvas");
      const octx = oc.getContext("2d");
      oc.width = img.width * RATIO;
      oc.height = img.height * RATIO;
      octx.drawImage(img, 0, 0, oc.width, oc.height);
      canvasStack[src] = oc;
      resolve();
    };
    img.src = `./img/${src}.png`;
  });
};

let promises = [];

["cliff_block_rock_SE", "cliff_block_stone_SE", "rock_largeD_SW"].forEach(
  (i) => {
    promises.push(loadImg(i));
  }
);

Promise.all(promises).then(() => {
  ctx.drawImage(canvasStack["cliff_block_rock_SE"], 0, 0);
  ctx.drawImage(canvasStack["cliff_block_rock_SE"], newX, newY);
  //ctx.drawImage(canvasStack["cliff_block_rock_SE"], stepX, stepY);
  ctx.drawImage(canvasStack["rock_largeD_SW"], newX, stepY);
});

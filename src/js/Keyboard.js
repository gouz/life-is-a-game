document.querySelector("body").addEventListener(
  "keydown",
  (e) => {
    switch (e.code) {
      case "ArrowDown":
        window.gouz_ge.moveAvatar("SW");
        break;
      case "ArrowUp":
        window.gouz_ge.moveAvatar("NE");
        break;
      case "ArrowLeft":
        window.gouz_ge.moveAvatar("NW");
        break;
      case "ArrowRight":
        window.gouz_ge.moveAvatar("SE");
        break;
      default:
        break;
    }
  },
  true
);

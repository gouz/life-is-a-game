export default class GamePad {
  constructor() {
    window.addEventListener("gamepadconnected", () => {
      this.trigger();
      this._interval = setInterval(this.trigger, 100);
    });
  }

  trigger() {
    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue;
      for (const [index, axis] of gamepad.axes.entries()) {
        if (0 == index) {
          if (-1 == axis) {
            window.gouz_ge.moveAvatar("NW");
          } else if (1 == axis) {
            window.gouz_ge.moveAvatar("SE");
          }
        } else if (1 == index) {
          if (-1 == axis) {
            window.gouz_ge.moveAvatar("NE");
          } else if (1 == axis) {
            window.gouz_ge.moveAvatar("SW");
          }
        }
      }
      for (const [index, button] of gamepad.buttons.entries()) {
        if (button.pressed) {
          if (0 == button.value || 1 == button.value) {
            window.gouz_ge.canOpenTreasureOrDoor();
          }
        }
      }
    }
  }
}

import "../less/main.less";
import GameEngine from "./GameEngine";

fetch("/json/config.json")
  .then((response) => {
    return response.json();
  })
  .then((config) => {
    window.gouz_ge = new GameEngine(config);
  });

import "../scss/styles.scss";

// import * as bootstrap from "bootstrap";
import UIController from "./UIController";
import SceneController from "./SceneController";
import GameController, { GameStatus } from "./GameController";
import Computer from "./Computer";

async function init() {
  const ui = new UIController();
  const scene = new SceneController(ui);
  const game = new GameController();
  await scene.createScene();

  const computer = new Computer(scene.computer!);
  computer.placeShips();

  game.definePlayers(...scene.players);
  game.start();
  ui.showPlayerInTurn(game.playerInTurn!);

  game.gameOverEvent.subscribe((sender, args) => {
    ui.showWinner(args);
  });

  game.playerInTurnChangedEvent.subscribe((sender, args) => {
    if (!args) return;
    ui.showPlayerInTurn(args);
    if (args === scene.computer && game.gameStatus === GameStatus.battle) {
      try{
      computer.attack(scene.player!, game);
      }
      catch(err){
        // console.log(err);
      }
    }
  });

  ui.boardClickedEvent.subscribe((sender, args) => {
    try {
      game.attack(game.playerInTurn!, args.player, args.row, args.col);
    } catch (err) {
      // console.log(err);
    }
  });
}

init();

import GameBoard from "./GameBoard";
import GameController from "./GameController";
import { invoker } from "./Invoker";
import Player from "./Player";
import Ship from "./Ship";
import UIController from "./UIController";

export default class SceneController {
  private _uiController!: UIController;
  players: Array<Player> = [];
  player?: Player;
  computer?: Player;

  constructor(uiController: UIController) {
    this._uiController = uiController;
  }

  async createScene() {
    const name = await this._uiController.definePlayerName();
    this.player = new Player(name, new GameBoard(10, 10), ...this.getShipSet());
    this.player.viewer = true;
    this.computer = new Player("Computer", new GameBoard(10, 10), ...this.getShipSet());
    this.players.push(this.player, this.computer);
    this._uiController.createView(...this.players);
    await this._uiController.placeShips(this.player);
  }

  private getShipSet(): Array<Ship> {
    return [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];
  }
}

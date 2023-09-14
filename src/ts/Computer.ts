import GameBoard from "./GameBoard";
import GameController from "./GameController";
import Player from "./Player";
import { getAreaForShip } from "./helpers";

export default class Computer {
  constructor(private controlledPlayer: Player) {}

  attack(player: Player, gameController: GameController) {
    const delay = Math.random() * 500 + 500;
    setTimeout(() => {
      const getRandomCoordinate = (): [number, number] => {
        return [this.getRandomRow(player.gameBoard), this.getRandomColumn(player.gameBoard)];
      };

      let coordinate: [number, number] = getRandomCoordinate();
      while (!player.gameBoard.isCoordinateAttackable(...coordinate)) {
        coordinate = getRandomCoordinate();
      }
      gameController.attack(this.controlledPlayer, player, ...coordinate);
    }, delay);
  }

  placeShips() {
    const gameBoard = this.controlledPlayer.gameBoard;
    let ship = this.controlledPlayer.ships.find((x) => !x.isPlaced);
    while (ship) {
      let placeable = false;
      while (!placeable) {
        const isVertical = Math.random() > 0.5;
        const area = getAreaForShip(this.getRandomRow(gameBoard), this.getRandomColumn(gameBoard), ship, isVertical);
        try {
          placeable = gameBoard.isAreaEmpty(area);
        } catch {}

        if (placeable) {
          gameBoard.placeShip(ship, area);
        }
      }
      ship = this.controlledPlayer.ships.find((x) => !x.isPlaced);
    }
  }

  private getRandomRow(gameBoard: GameBoard): number {
    return Math.floor(Math.random() * gameBoard.rowCount);
  }

  private getRandomColumn(gameBoard: GameBoard): number {
    return Math.floor(Math.random() * gameBoard.columnCount);
  }
}

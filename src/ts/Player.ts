import GameBoard from "./GameBoard";
import { invoker } from "./Invoker";
import Ship from "./Ship";

export default class Player {
  private _name: string = "";
  private _gameBoard!: GameBoard;
  private _ships!: Array<Ship>;

  viewer: boolean = false;

  get name(): string {
    return this._name;
  }

  get gameBoard(): GameBoard {
    return this._gameBoard;
  }

  get ships(): Array<Ship> {
    return [...this._ships];
  }

  constructor(name: string, gameBoard: GameBoard, ...ships: Array<Ship>) {
    this._name = name;
    this._gameBoard = gameBoard;
    this._ships = ships;
  }

  attack(row: number, col: number, gameBoard: GameBoard) {
    invoker.throwIf(!gameBoard.isCoordinateAttackable(row, col), "The field is already attacked");
    gameBoard.receiveAttack(row, col);
  }
}

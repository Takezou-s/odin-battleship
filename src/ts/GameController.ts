import { createEvent } from "./Event";
import GameBoard, { CellStatus } from "./GameBoard";
import { invoker } from "./Invoker";
import Player from "./Player";

export default class GameController {
  private _activePlayers!: Array<Player>;
  private _deactivePlayers: Array<Player> = [];
  private _turn: number = 0;
  private _gameStatus: GameStatus = GameStatus.idle;
  private _gameStatusChanged = createEvent<GameStatus>();
  private _gameOver = createEvent<Player>();
  private _playerInTurnChanged = createEvent<Player | undefined>();

  get gameStatusChangedEvent() {
    return this._gameStatusChanged.event;
  }

  get gameOverEvent() {
    return this._gameOver.event;
  }

  get playerInTurnChangedEvent() {
    return this._playerInTurnChanged.event;
  }

  get gameStatus() {
    return this._gameStatus;
  }

  private set gameStatus(value: GameStatus) {
    this._gameStatus = value;
    this._gameStatusChanged.notify(this, value);
  }

  get playerInTurn(): Player | undefined {
    return this._activePlayers[this._turn];
  }

  definePlayers(...players: Array<Player>) {
    invoker.throwIf(this._gameStatus !== GameStatus.idle, "Can not define players at this state of the game!");
    invoker.throwIf(players.length <= 1, "Need more than one player for game to start!");
    this._activePlayers = players;
    this.gameStatus = GameStatus.ready;
  }

  start() {
    invoker.throwIf(this._gameStatus !== GameStatus.ready, "Game is not ready to start. Define players first!");
    this.gameStatus = GameStatus.battle;
  }

  attack(attacker: Player, defender: Player, row: number, col: number) {
    invoker.throwIf(
      this._gameStatus !== GameStatus.battle,
      "Can not attack at this state of the game! Define players and start the game first."
    );
    invoker.throwIf(attacker === defender, "Players can not attack themselves!");
    invoker.throwIf(this._activePlayers.findIndex((x) => x === defender) < 0, "This player is out of game! Try another.");
    invoker.throwIf(
      this._activePlayers.findIndex((x) => x === attacker) !== this._turn,
      "Attack failed! It is not this player's turn yet!"
    );
    invoker.throwIf(!defender.gameBoard.isCoordinateAttackable(row, col), "The field is already attacked! Try another field.");
    defender.gameBoard.receiveAttack(row, col);
    if (defender.gameBoard.isAllSunk()) {
      this._deactivePlayers.push(defender);
      const index = this._activePlayers.findIndex((x) => x === defender);
      if (index !== -1) this._activePlayers.splice(index, 1);
    }
    if (this._activePlayers.length === 1) {
      this._gameOver.notify(this, this._activePlayers[0]);
      this.gameStatus = GameStatus.over;
    }
    this._nextPlayer();
  }

  private _nextPlayer() {
    this._turn++;
    if (this._turn >= this._activePlayers.length) this._turn = 0;
    this._playerInTurnChanged.notify(this, this.playerInTurn);
  }
}

export enum GameStatus {
  idle = "idle",
  ready = "ready",
  battle = "battle",
  over = "over",
}

import { Modal } from "bootstrap";
import Player from "./Player";
import Ship, { Area } from "./Ship";
import { CellStatus } from "./GameBoard";
import { createEvent } from "./Event";
import { getAreaForShip } from "./helpers";

export default class UIController {
  private _playerViewPair: Array<{ player: Player; view: HTMLElement }> = [];
  private _isPlacingShips: boolean = false;
  private _isVertical: boolean = false;
  private _shipToPlace?: Ship | null = null;
  private _boardClicked = createEvent<{ player: Player; row: number; col: number }>();

  get boardClickedEvent() {
    return this._boardClicked.event;
  }

  showWinner(player: Player) {
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal fade" style="z-index: 9999" id="winner-modal" tabindex="-1" aria-labelledby="winner-modal-label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-body text-center">
                <h2>Winner</h2>
                <h1>${player.name}</h1>
              </div>
            </div>
          </div>
        </div>
        `;
    document.body.appendChild(modal);
    const modalHandler = new Modal("#winner-modal");
    modalHandler.show();
  }

  showPlayerInTurn(player: Player) {
    this._playerViewPair.forEach((x) => {
      x.view.querySelector("h3")!.style.backgroundColor = x.player === player ? "#35A29F" : "";
    });
    this.disableBoard(player);
  }

  disableBoard(player: Player) {
    this._playerViewPair.forEach((x) => {
      const board = x.view.querySelector("div.board");
      const condition = x.player === player;

      board?.classList.remove(condition ? "attackable" : "not-attackable");
      board?.classList.add(condition ? "not-attackable" : "attackable");
    });
  }

  /**
   * Displays an input element to fetch player name.
   * @returns Specified player name.
   */
  definePlayerName(): Promise<string> {
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal fade" style="z-index: 9999" id="player-name-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="player-name-modal-label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="player-name-modal-label">Name</h1>
              </div>
              <form>
                <div class="modal-body">
                  <input type="text" class="form-control" minlength="3" id="playerName" name="playerName" required>
                </div>
                <div class="modal-footer">
                  <button id="player-name-modal-save-button" type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        `;
    document.body.appendChild(modal);
    const modalHandler = new Modal("#player-name-modal");
    modalHandler.show();
    return new Promise((resolve, reject) => {
      const form = modal.querySelector("form")!;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = modal.querySelector("input")!.value;
        modalHandler.hide();
        modal.remove();
        resolve(value);
      });
    });
  }

  /**
   * Creates and renders player infos on screen.
   * @param players Players whose infos will be rendered.
   */
  createView(...players: Array<Player>) {
    const container = document.getElementById("container")!;
    players.forEach((player) => {
      const playerView = document.createElement("div");
      playerView.className = "col-10 col-sm-8 col-md-6 col-lg-4 p-2";
      playerView.innerHTML = `
        <h3 class="text-center">${player.name}</h3>
        `;
      const board = this._getBoard(player);
      if (!player.viewer) board.classList.add("hidden");
      playerView.appendChild(board);
      playerView.querySelector("div.board")!.addEventListener("click", this._boardClickHandler.bind(this, player));

      container.append(playerView);
      this._playerViewPair.push({ player, view: playerView });
      player.gameBoard.cellStatusChangedEvent.subscribe(this._cellStatusChangedHandler.bind(this, board));
      player.gameBoard.shipPlacedEvent.subscribe(this._shipPlacedHandler.bind(this, board));
    });
  }

  /**
   * Displays UI for player to place ships.
   * @param player Player whose ships will be placed.
   */
  async placeShips(player: Player) {
    this._isPlacingShips = true;
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal fade" style="z-index: 9999" id="place-ship-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="place-ship-modal-label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="place-ship-modal-label">${player.name} is placing!</h1>
              </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                  <button id="place-ship-modal-rotate-button" type="button" class="btn btn-primary">Rotate</button>
                </div>
            </div>
          </div>
        </div>
        `;
    modal.querySelector("div.modal-body")!.appendChild(this._getBoard(player));

    modal.querySelector("button")!.addEventListener("click", () => (this._isVertical = !this._isVertical));

    modal.querySelector("div.board")!.addEventListener("click", this._boardClickHandler.bind(this, player));
    modal.querySelector("div.board")!.addEventListener("mousemove", this._boardMouseMoveHandler.bind(this, player));

    document.body.appendChild(modal);
    const modalHandler = new Modal("#place-ship-modal");
    modalHandler.show();

    await new Promise(async (resolve, reject) => {
      this._shipToPlace = player.ships.find((x) => !x.isPlaced);
      while (this._shipToPlace) {
        await new Promise((innerResolve, innerReject) => {
          const intervalId = setInterval(
            () => {
              if (!this._shipToPlace) {
                clearInterval(intervalId);
                innerResolve(true);
              }
            },
            50,
            null
          );
        });
        this._shipToPlace = player.ships.find((x) => !x.isPlaced);
      }
      resolve(true);
    });

    modalHandler.hide();
    modal.remove();
    this._isPlacingShips = false;
  }

  private _cellStatusChangedHandler(boardEl: HTMLElement, sender: any, args: { row: number; col: number; cellStatus: CellStatus }) {
    const cell = boardEl.querySelector(`[data-row="${args.row}"][data-col="${args.col}"]`);
    if (cell) {
      (cell as HTMLElement).style.backgroundColor =
        args.cellStatus === CellStatus.empty ? "" : args.cellStatus === CellStatus.hit ? "#35A29F" : "#AE445A";
      (cell as HTMLElement).dataset.cellStatus = args.cellStatus;
    }
  }

  private _shipPlacedHandler(boardEl: HTMLElement, sender: any, args: { ship: Ship; area: Area }) {
    let diff = args.area.bottom - args.area.top;
    let start = args.area.top;
    let isVertical = true;
    if (diff < args.area.right - args.area.left) {
      diff = args.area.right - args.area.left;
      start = args.area.left;
      isVertical = false;
    }
    for (let i = 0; i <= diff; i++) {
      boardEl
        .querySelector(
          `[data-row="${isVertical ? args.area.top + i : args.area.top}"][data-col="${
            !isVertical ? args.area.left + i : args.area.left
          }"]`
        )
        ?.classList.add("placed");
    }
  }

  private _boardClickHandler(player: Player, event: any) {
    const target = event.target as HTMLElement;
    if (!target.dataset.row) return;
    const row = +target.dataset.row;
    const col = +target.dataset.col!;
    if (this._isPlacingShips) {
      if (!target.classList.contains("place-prev-yes") || !this._shipToPlace) return;

      const ship = this._shipToPlace;
      if (ship) {
        for (let i = 0; i < ship.length; i++) {
          const cell = target.parentElement!.querySelector(
            `[data-row="${!this._isVertical ? row : row + i}"][data-col="${!this._isVertical ? col + i : col}"]`
          );

          cell?.classList.remove("place-prev-no");
          cell?.classList.remove("place-prev-yes");
          cell?.classList.add("placed");
        }
        player.gameBoard.placeShip(ship, getAreaForShip(row, col, ship, this._isVertical));
        this._shipToPlace = null;
      }
    } else {
      this._boardClicked.notify(this, { player, row, col });
    }
  }

  private _boardMouseMoveHandler(player: Player, event: any) {
    const target = event.target as HTMLElement;
    target.parentElement?.querySelectorAll(".place-prev-yes").forEach((x) => x.classList.remove("place-prev-yes"));
    target.parentElement?.querySelectorAll(".place-prev-no").forEach((x) => x.classList.remove("place-prev-no"));
    if (!target.dataset.row || !this._shipToPlace) return;
    const row = +target.dataset.row;
    const col = +target.dataset.col!;
    const ship = this._shipToPlace;
    if (ship) {
      const area: Area = getAreaForShip(row, col, ship, this._isVertical);
      let placeable = false;
      try {
        placeable = player.gameBoard.isAreaEmpty(area);
      } catch (error) {}

      for (let i = 0; i < ship.length; i++) {
        const cell = target.parentElement!.querySelector(
          `[data-row="${!this._isVertical ? row : row + i}"][data-col="${!this._isVertical ? col + i : col}"]`
        );

        cell?.classList.add(placeable ? "place-prev-yes" : "place-prev-no");
        cell?.classList.remove(placeable ? "place-prev-no" : "place-prev-yes");
      }
    }
  }

  private _getBoard(player: Player): HTMLElement {
    let boardCells = "";
    for (let i = 0; i < player.gameBoard.rowCount; i++) {
      for (let j = 0; j < player.gameBoard.columnCount; j++) {
        boardCells += `<div class="board-cell border border-dark" data-row="${i}" data-col="${j}"></div>`;
      }
    }
    const templateColumns = `repeat(${player.gameBoard.columnCount}, ${100 / player.gameBoard.columnCount}%)`;

    const container = document.createElement("div");
    container.className = "board";
    container.style.gridTemplateColumns = templateColumns;
    container.innerHTML = boardCells;

    return container;
  }
}

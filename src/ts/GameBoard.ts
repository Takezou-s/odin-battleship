import { createEvent } from "./Event";
import { invoker } from "./Invoker";
import Ship, { Area } from "./Ship";

export default class GameBoard {
  private _ships: Array<Ship> = [];
  private _cells: Array<Array<CellStatus>> = [];
  private _cellStatusChanged = createEvent<{ row: number; col: number; cellStatus: CellStatus }>();
  private _shipPlaced = createEvent<{ ship: Ship; area: Area }>();

  get cellStatusChangedEvent() {
    return this._cellStatusChanged.event;
  }

  get shipPlacedEvent() {
    return this._shipPlaced.event;
  }

  get rowCount(): number {
    return this._cells.length;
  }

  get columnCount(): number {
    return (this._cells[0] && this._cells[0].length) || 0;
  }

  constructor(row: number, col: number) {
    invoker.throwIf(row <= 0 || col <= 0, "Row and column counts must be bigger than 0!");
    for (let i = 0; i < row; i++) {
      this._cells.push([]);
      for (let j = 0; j < col; j++) {
        this._cells[i].push(CellStatus.empty);
      }
    }
  }

  placeShip(ship: Ship, area: Area) {
    this._throwIfOutOfBoundaries(area);
    invoker.throwIf(!this.isAreaEmpty(area), "Area is already taken!");
    ship.place(area);
    this._ships.push(ship);
    this._shipPlaced.notify(this, { ship, area });
  }

  receiveAttack(row: number, col: number) {
    this._throwIfOutOfBoundaries(row, col);
    invoker.throwIf(this.getCellStatus(row, col) !== CellStatus.empty, "The field is already attacked!");
    const ship = this._getShipAtCoordinate(row, col);
    ship?.hit();
    const cellStatus = ship ? CellStatus.hit : CellStatus.missed;
    this._setCellStatus(cellStatus, row, col);
    this._cellStatusChanged.notify(this, { row, col, cellStatus });
  }

  getCellStatus(row: number, col: number): CellStatus {
    this._throwIfOutOfBoundaries(row, col);
    return this._cells[row][col];
  }

  isAllSunk(): boolean {
    return this._ships.every((x) => x.isSunk());
  }

  isAreaEmpty(area: Area): boolean {
    this._throwIfOutOfBoundaries(area);
    return !this._ships.find(
      (ship) =>
        ship.area &&
        ((area.left >= ship.area.left && area.left <= ship.area.right) ||
          (area.right >= ship.area.left && area.right <= ship.area.right)) &&
        ((area.top >= ship.area.top && area.top <= ship.area.bottom) ||
          (area.bottom >= ship.area.top && area.bottom <= ship.area.bottom))
    );
  }

  isCoordinateAttackable(row: number, col: number): boolean {
    return this._isInBoundaries(row, col) && this.getCellStatus(row, col) === CellStatus.empty;
  }

  private _setCellStatus(status: CellStatus, row: number, col: number): void {
    this._cells[row][col] = status;
  }

  private _throwIfOutOfBoundaries(area: Area): void;
  private _throwIfOutOfBoundaries(row: number, col: number): void;
  private _throwIfOutOfBoundaries(rowOrArea: number | Area, col?: number): void {
    const row = rowOrArea as number;
    const area = rowOrArea as Area;
    if (col !== undefined) invoker.throwIf(!this._isInBoundaries(rowOrArea as number, col), "Specified values are out of boundaries!");
    else {
      this._throwIfOutOfBoundaries(area.top, area.right);
      this._throwIfOutOfBoundaries(area.bottom, area.left);
    }
  }

  private _isInBoundaries(row: number, col: number): boolean {
    return row >= 0 && row < this.rowCount && col >= 0 && col < this.columnCount;
  }

  private _getShipAtCoordinate(row: number, col: number): Ship | undefined {
    return this._ships.find((x) => x.area && row >= x.area.top && row <= x.area.bottom && col >= x.area.left && col <= x.area.right);
  }
}

export enum CellStatus {
  empty = "empty",
  hit = "hit",
  missed = "missed",
}

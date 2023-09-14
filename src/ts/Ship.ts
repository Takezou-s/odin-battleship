import { invoker } from "./Invoker";

export default class Ship {
  private _length: number = 0;
  private _hitCount: number = 0;
  private _area: Area | null = null;
  private _isPlaced: boolean = false;

  get length(): number {
    return this._length;
  }

  private set length(value: number) {
    this._length = value;
  }

  get hitCount(): number {
    return this._hitCount;
  }

  private set hitCount(value: number) {
    this._hitCount = value;
  }

  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  get isPlaced(): boolean {
    return this._isPlaced;
  }

  private set isPlaced(value: boolean) {
    this._isPlaced = value;
  }

  constructor(length: number) {
    invoker.throwIf(length <= 0, "Length must be bigger than 0!");
    this.length = length;
  }

  hit(): void {
    if (this.isSunk()) return;
    this.hitCount++;
  }

  isSunk(): boolean {
    return this._length <= this._hitCount;
  }

  place(area: Area) {
    this.area = area;
    this.isPlaced = true;
  }
}

export type Area = { top: number; right: number; bottom: number; left: number };

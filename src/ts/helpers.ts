import Ship from "./Ship";

export function getAreaForShip(row: number, col: number, ship: Ship, isVertical: boolean = false) {
  return {
    top: row,
    right: !isVertical ? col + ship.length - 1 : col,
    bottom: !isVertical ? row : row + ship.length - 1,
    left: col,
  };
}

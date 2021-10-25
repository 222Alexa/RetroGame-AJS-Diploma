import { calcTileType, calcHealthLevel } from "../utils";

describe("boardSize = 3", () => {
  const boardSize = 3;

  test.each([
    [0, "top-left"],
    [1, "top"],
    [2, "top-right"],
    [3, "left"],
    [4, "center"],
    [5, "right"],
    [6, "bottom-left"],
    [7, "bottom"],
    [8, "bottom-right"],
  ])("Функция корректно возвращает значения", (index, expected) => {
    expect(calcTileType(index, boardSize)).toBe(expected);
  });
});

test.each([
  [3, "critical"],
  [35, "normal"],
  [55, "high"],
])("Функция корректно возвращает статус здоровья", (health, expected) => {
  expect(calcHealthLevel(health)).toBe(expected);
});

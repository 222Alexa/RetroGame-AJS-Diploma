/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
import PositionedCharacter from "./PositionedCharacter";

export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  // рандомный выбор и создание персонажа
  const type = Math.floor(Math.random() * allowedTypes.length);
  const level = Math.ceil(Math.random() * maxLevel);
  yield new allowedTypes[type](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount, survivor) {
  // TODO: write logic here
  // создание команды из персонажей
  const teamCharacters = [];

  for (let i = 0; i < characterCount; i += 1) {
    const generator = characterGenerator(allowedTypes, maxLevel);
    teamCharacters.push(generator.next().value);
  }
  if (survivor.length > 0) {
    survivor.forEach((element) => teamCharacters.push(element));
  }
  return teamCharacters;
}

// готово

/**
 * массив со стартовыми координатами для игроков
 *
 * @param characterCount количество персонажей в команде
 * @param player 'human' или 'skyNet'
 * @param boardSize ширина поля
 * @returns массив со стартовыми координатами персонажей
 */

export function getPositions(characterCount, player, boardSize = 8) {
  const positionsArr = [];
  const possiblePositions = [];
  for (let i = 0; i < boardSize ** 2; i += boardSize) {
    if (player === "human") {
      possiblePositions.push(i, i + 1);
    }
    if (player === "skyNet") {
      possiblePositions.push(i + boardSize - 2, i + boardSize - 1);
    }
  }
  let possibleCountPositions = boardSize * 2;
  for (let i = 0; i < characterCount; i += 1) {
    const position = Math.floor(Math.random() * possibleCountPositions);
    positionsArr.push(possiblePositions[position]);
    possiblePositions.splice(position, 1);
    possibleCountPositions -= 1;
  }

  return positionsArr;
}

/* board = [0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13, 14, 15,
        16, 17, 18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29, 30, 31,
        32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47,
        48, 49, 50, 51, 52, 53, 54, 55,
        56, 57, 58, 59, 60, 61, 62, 63,
        ]
*/

// формирование команды с игроками и позициями
export function createTeamWithPos(teamPlayer, positionsArr) {
  const arr = positionsArr;
  return teamPlayer.reduce((acc, prev) => {
    const coordPlayer =
      arr[Math.floor(Math.random() * (positionsArr.length - 1))];
    // console.log(poss);
    acc.push(new PositionedCharacter(prev, coordPlayer));
    // console.log(acc);
    arr.splice(arr.indexOf(coordPlayer), 1);
    return acc;
  }, []);
}

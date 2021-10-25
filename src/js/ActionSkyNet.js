import { isPosibleAttack, isRadius } from "./action";

export function createActionArr(skyNetArr, humanArr) {
  // массивы с игроками с учетом атаки и дистанции. вынести в функцию *ход бота
  // (this.skyNetTeamsWithPos, this.humanTeamsWithPos)
  const skyNetAttacker = [];
  const skyNetMoving = [];
  skyNetArr.forEach((skyNet) => {
    humanArr.forEach((human) => {
      const moveAttack = isPosibleAttack(
        skyNet.character.type,
        human.position,
        skyNet.position
      );
      const distance = isRadius(skyNet.position, human.position);
      if (moveAttack) {
        skyNetAttacker.push([skyNet.position, human.position]);
      }
      if (!moveAttack) {
        skyNetMoving.push([skyNet.position, human.position, distance]);
      }
    });
  });
  // console.log(skyNetMoving, 'массив игроков');
  return [skyNetAttacker, skyNetMoving];
}

export function sortedMinDistansMaxAttack(skyNetMoving, skyNetArr) {
  // (skyNetMoving, this.skyNetTeamsWithPos)
  const dimensionalDistance = skyNetMoving.sort((x, y) => x[2] - y[2]); // сортирует по дистанции.
  const minimDistance = dimensionalDistance.filter(
    (item) => dimensionalDistance[0][2] === item[2]
  ); // ищет ближайших.
  // console.log(dimensionalDistance, 'массив дистанций');
  // console.log(minimDistance, 'самая короткая дистанция');

  // сортировка массива ботов по радиусу атаки

  const skyNetMovingSortedRadiusAttack = minimDistance.sort(
    (x, y) =>
      skyNetArr.find((skyNet) => skyNet.position === x[0]).character.attack -
      skyNetArr.find((skyNet) => skyNet.position === y[0]).character.attack
  );
  // console.log(skyNetMovingSortedRadiusAttack, '++');

  // ближайший к игроку перснонаж с максимальным радиусом атаки

  const targetChar = minimDistance.filter(
    (item) =>
      skyNetArr.find(
        (skyNet) => skyNet.position === skyNetMovingSortedRadiusAttack[0][0]
      ).character.attack ===
      skyNetArr.find((skyNet) => skyNet.position === item[0]).character.attack
  );

  // console.log(targetChar, 'ближайший к игроку перснонаж с максимальным радиусом атаки');
  return targetChar;
}

export function sortedMoveAttack(skyNetAttacker, skyNetArr) {
  // сильнейшие боты (skyNetAttacker,this.skyNetTeamsWithPos)
  const sortedAttackSkyNet = skyNetAttacker.sort(
    (x, y) =>
      skyNetArr.find((skyNet) => skyNet.position === y[0]).character.attack -
      skyNetArr.find((skyNet) => skyNet.position === x[0]).character.attack
  );
  // console.log(sortedAttackSkyNet, 'атака');

  const persWithMaxAttack = skyNetAttacker.filter(
    (item) =>
      skyNetArr.find((skyNet) => skyNet.position === item[0]).character.attack -
      skyNetArr.find((skyNet) => skyNet.position === sortedAttackSkyNet[0][0])
        .character.attack
  );

  // console.log(persWithMaxAttack, 'самый сильный');

  let attackerSkyNet = persWithMaxAttack; // выбери самого сильного, если его нет - рандом.
  if (persWithMaxAttack.length === 0)
    attackerSkyNet =
      sortedAttackSkyNet[Math.floor(Math.random() * sortedAttackSkyNet.length)];
  // console.log(attackerSkyNet, 'attackerSkyNet');
  return attackerSkyNet;
}

export function sortedEnergyAttack(attackerSkyNet, humanArr) {
  const sortedEnergyArr = attackerSkyNet.sort(
    (a, b) => isRadius(a[0], a[1]) - isRadius(b[0], b[1])
  );
  const ret = isRadius(sortedEnergyArr[0][0], sortedEnergyArr[0][1]);
  console.log(sortedEnergyArr);
  console.log(ret);
}

export function calcMovingCells(targetChar) {
  // выбор ячейки для шага вперед
  const movingCells = [];
  targetChar.forEach((item) => {
    const Y = Math.floor(item[0] / 8) - Math.floor(item[1] / 8);
    // console.log(Y, 'вертикаль')
    const X = (item[0] % 8) - (item[1] % 8);
    let newPosition = item[0];
    // console.log(X, 'горизонталь')
    if (!Y && X < 0) {
      // вправо
      movingCells.puch(item[0], item[0] + 1);
    }
    if (Y > 0 && !X) {
      // вверх
      movingCells.push(item[0], item[0] - 8);
    }
    if (!Y && X > 0) {
      // влево
      movingCells.push(item[0], item[0] - 1);
    }
    if (Y < 0 && !X) {
      // вниз
      movingCells.push(item[0], item[0] + 8);
    }

    if (X && Y) {
      if (X > 0) newPosition -= 1;
      if (X < 0) newPosition += 1;
      if (Y > 0) newPosition -= 8;
      if (Y < 0) newPosition += 8;
    }
    movingCells.push(item[0], newPosition);
  });
  // console.log(movingCells, 'новая позиция');
  return movingCells;
}

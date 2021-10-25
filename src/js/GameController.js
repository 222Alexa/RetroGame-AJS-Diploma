import themes from "./themes";
import cursors from "./cursors";
import PositionedCharacter from "./PositionedCharacter";
import Team from "./Team";
import GamePlay from "./GamePlay";
import GameState from "./GameState";
import {
  generateTeam,
  characterGenerator,
  getPositions,
  createTeamWithPos,
} from "./generators";
import { isPosibleAttack, isPosibleStep, isRadius } from "./action";
import {
  createActionArr,
  sortedMinDistansMaxAttack,
  sortedEnergyAttack,
  sortedMoveAttack,
  calcMovingCells,
} from "./ActionSkyNet";

import Bowman from "./CharacterList/Bowman";
import Magician from "./CharacterList/Magician";
import Swordsman from "./CharacterList/Swordsman";
import Undead from "./CharacterList/Undead";
import Vampire from "./CharacterList/Vampire";
import Daemon from "./CharacterList/Daemon";
import Character from "./CharacterList/Character";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.char = null;
    this.selectedPlayer = null;
    this.selectedChar = undefined;
    this.currentTurn = "player";
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.prepareGame(); // подготовка игры
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellLeave.bind(this));
  }

  prepareGame() {
    this.currentLevel = 1;
    this.gamePlay.drawUi(themes.prairie);
    this.humanTeams = generateTeam(
      new Team().humanType,
      1,
      2,
      [],
      this.gamePlay.boardSize
    );
    this.skyNetTeams = generateTeam(
      new Team().skyNetType,
      1,
      2,
      [],
      this.gamePlay.boardSize
    );
    this.generateTeamsPosition(this.humanTeams, this.skyNetTeams); // здесь работает...
    /* this.humanPositions = getPositions(2, "human", this.gamePlay.boardSize); // позиции 'человеков'
    this.skyNetPositions = getPositions(2, "skyNet", this.gamePlay.boardSize); // позиции ботов

    this.humanTeamsWithPos = createTeamWithPos(this.humanTeams, this.humanPositions); // команда человеков с позициями
    this.skyNetTeamsWithPos = createTeamWithPos(
      this.skyNetTeams,
      this.skyNetPositions
    );

    // команда ботов с позициями
    this.players = [...this.humanTeamsWithPos, ...this.skyNetTeamsWithPos]; // объединенный массив игроков
    console.log(this.players, 'players');
    this.humanTurn = true; // ход игрока
    this.gamePlay.redrawPositions(this.players);
    */
  }

  onNewGame() {
    this.prepareGame();
  }

  // Выделение персонажа

  onCellEnter(index) {
    // вход курсора в ячейку
    // TODO: react to mouse enter

    this.hoverChar = this.players.find((item) => item.position === index);

    if (this.hoverChar) {
      this.gamePlay.cells.forEach((cell, number) => {
        number !== index;
        this.gamePlay.deselectCell(number);
      });
      const { level, attack, deffence, health } = this.hoverChar.character;

      const message = `${"\u{1F396}"} ${level} ${"\u{2694}"} ${attack} ${"\u{1F6E1}"} ${deffence} ${"\u2764"} ${health}`;
      this.gamePlay.showCellTooltip(message, index);
      this.gamePlay.setCursor(cursors.pointer);
    }

    const isSkyNetCell = this.skyNetTeamsWithPos.some(
      (skyNet) => skyNet.position === index
    );
    const isHumanCell = this.humanTeamsWithPos.some(
      (human) => human.position === index
    );
    this.step = isPosibleStep(this.char, this.selectedPlayer, index); // надо исправить на selectedshar, а то дублируется индекс клетки
    this.moveAttack = isPosibleAttack(this.char, this.selectedPlayer, index);

    // Если есть выделенный персонаж и наведение на пустую ячейку
    if (!isSkyNetCell && !isHumanCell && this.selectedChar) {
      this.gamePlay.cells.forEach((cell, number) => {
        number !== index;
        this.gamePlay.deselectCell(number);
        this.gamePlay.selectCell(this.selectedChar.position);
      });

      // для проверки возможности хода
      if (this.step === true) {
        this.gamePlay.selectCell(index, "green");
        this.gamePlay.setCursor("auto");
      } else {
        this.gamePlay.setCursor("not-allowed");
      }
    }
    // наведение на персонажа противника
    if (isSkyNetCell && this.selectedChar) {
      this.skyNetTeamsWithPos.forEach((el) =>
        this.gamePlay.deselectCell(el.position)
      );
      this.gamePlay.selectCell(this.selectedChar.position);
      if (this.moveAttack === true) {
        this.gamePlay.selectCell(index, "red");
        this.gamePlay.setCursor("crosshair");
      } else {
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor("not-allowed");
      }
    }
    // наведение на персонажа
    if (isHumanCell && this.selectedChar) {
      this.gamePlay.selectCell(this.selectedChar.position);
    }
  }

  onCellLeave(index) {
    // выход курсора из ячейки
    // TODO: react to mouse leave

    if (!this.hoverChar) this.gamePlay.hideCellTooltip(index);
  }

  onSaveGameClick() {
    // сохранение текущей игры

    this.state = {
      players: this.players,
    };

    this.stateService.save(this.state);
    GamePlay.showMessage("Saved!");
  }

  onLoadGameClick() {
    if (this.state) {
      console.log(GameState.from(this.stateService.load()), "GameState");
    } else {
      GamePlay.showMessage("Нет сохраненных игр!");
    }
  }

  async onCellClick(index) {
    // TODO: react to click

    const isSkyNetCell = this.finderChar(this.skyNetTeamsWithPos, index); // кликнутый персонаж/position
    const isHumanCell = this.finderChar(this.humanTeamsWithPos, index); // кликнутый персонаж/position

    this.step = isPosibleStep(this.char, this.selectedPlayer, index); // расчет возможности ходить
    this.moveAttack = isPosibleAttack(this.char, this.selectedPlayer, index); // расчет возможности атаки

    // Выделяем одного из своих персонажей
    let currentChar = this.finderChar(this.players, index); // то целый игрок

    if (currentChar && isHumanCell) {
      this.players.forEach((el) => this.gamePlay.deselectCell(el.position));

      this.selectedChar = currentChar;
      this.selectedPlayer = this.selectedChar.position; // а это индекс игрока
      this.char = this.selectedChar.character.type; // а это название персонажа
      this.gamePlay.selectCell(this.selectedChar.position);
    }
    if (this.selectedChar && !currentChar && this.step === true) {
      // если есть выделенный персонаж, клетка не занята и доступна для перемещения
      this.players.forEach((el) => this.gamePlay.deselectCell(el.position));
      currentChar = this.selectedChar;
      currentChar.position = index;

      this.gamePlay.redrawPositions(this.players);

      this.reverseOfTurn();
      this.targetSkyNetChar();
    }

    if (this.selectedChar && !currentChar && this.step === false) {
      console.log("далековато");
    }

    if (isSkyNetCell) {
      // если в клетке есть противник
      if (this.selectedChar && this.moveAttack === true) {
        // если есть выделенный персонаж и возможна атака

        await this.endOfTurn(this.selectedChar, isSkyNetCell);
        this.reverseOfTurn();
        this.targetSkyNetChar();
      } else {
        GamePlay.showError("Выбeрите игрока своей команды!");
      }
    }
  }

  async targetSkyNetChar() {
    this.players.forEach((el) => this.gamePlay.deselectCell(el.position));
    this.skyNetTeamsWithPos = this.filtredHealth(this.skyNetTeamsWithPos);
    this.humanTeamsWithPos = this.filtredHealth(this.humanTeamsWithPos);
    if (!Object.keys(this.skyNetTeamsWithPos).length) {
      this.nextLevel(this.players);
      this.levelUpgrade();
    }

    const agregateArr = createActionArr(
      // создали массив с количеством, позициями ботов и расстоянием до целей
      this.skyNetTeamsWithPos,
      this.humanTeamsWithPos
    );

    const skyNetAttackArr = agregateArr[0]; // кто может атаковать
    const skyNetMoving = agregateArr[1]; // количество и позиции ботов на поле

    if (!skyNetAttackArr.length) {
      // если атаковать некому, найди ближайшего с минимальной дистацией и максимальной атакой
      const moveTargetSkyNetAttack = sortedMinDistansMaxAttack(
        skyNetMoving,
        this.skyNetTeamsWithPos
      );

      const isEmptyCellsforStepArr = calcMovingCells(moveTargetSkyNetAttack); // индекс клетки, откуда он пойдет

      this.targetSkyNet = this.skyNetTeamsWithPos.find(
        (skyNet) => skyNet.position === isEmptyCellsforStepArr[0]
      );

      if (!isEmptyCellsforStepArr.length) {
        return;
      }

      this.targetSkyNet.position = isEmptyCellsforStepArr[1]; // здесь ошибка линтера prefer-destructuring, увеличила правила, тк не поняла как еще декомпозировать
      console.log(isEmptyCellsforStepArr, "isEmptyCellsforStepArr");
      console.log(isEmptyCellsforStepArr[1], "isEmptyCellsforStepArr");

      this.gamePlay.redrawPositions(this.players);
      this.reverseOfTurn();
      return;
    }

    this.targetSkyNet = this.skyNetTeamsWithPos.find(
      (skyNet) => skyNet.position === skyNetAttackArr[0][0]
    );

    this.targetHuman = this.humanTeamsWithPos.find(
      (human) => human.position === skyNetAttackArr[0][1]
    );

    if (skyNetAttackArr.length) {
      const sortedEnergyArr = skyNetAttackArr.sort(
        (a, b) => isRadius(a[0], a[1]) - isRadius(b[0], b[1])
      );

      this.targetSkyNet = this.skyNetTeamsWithPos.find(
        (skyNet) => skyNet.position === sortedEnergyArr[0][0]
      );
      this.targetHuman = this.humanTeamsWithPos.find(
        (human) => human.position === sortedEnergyArr[0][1]
      );

      /* const distanseEnergyAttack = isRadius(sortedEnergyArr[0][0], sortedEnergyArr[0][1]);
			console.log(distanseEnergyAttack, 'количество клеток до цели у сильнейшего персонажа');
	*/
    }

    await this.endOfTurn(this.targetSkyNet, this.targetHuman);
    this.reverseOfTurn();
  }

  async endOfTurn(a, b) {
    const damage = Math.max(
      a.character.attack - b.character.deffence,
      a.character.attack * 1
    );
    b.character.health -= damage;

    await this.gamePlay.showDamage(b.position, damage);
    this.players.forEach((el) => this.gamePlay.deselectCell(el.position));
    this.players = this.filtredHealth(this.players);

    this.selectedChar = null;
    this.players.forEach((el) => this.gamePlay.deselectCell(el.position));

    this.gamePlay.redrawPositions(this.players);
  }

  reverseOfTurn() {
    if (this.currentTurn === "player") this.currentTurn = "skyNet";
    else {
      this.currentTurn === "player";
    }
  }

  finderChar(arr, index) {
    return arr.find((char) => char.position === index);
  }

  filtredHealth(obj) {
    return obj.filter((el) => el.character.health > 0);
  }

  nextLevel(arr) {
    this.humanTeamsWithPos.forEach((elem) => elem.character.levelUp()); // повышение уровня выжившим

    this.survivor = []; // массив для выживших
    this.humanTeamsWithPos.forEach((elem) =>
      this.survivor.push(elem.character)
    );

    this.currentLevel += 1;

    if (this.currentLevel === 2) {
      this.humanNewTeams = generateTeam(
        new Team().humanType,
        2,
        1,
        this.survivor,
        this.gamePlay.boardSize
      );
      this.skyNetNewTeams = generateTeam(
        new Team().skyNetType,
        this.random(1, 2),
        this.humanNewTeams.length,
        this.gamePlay.boardSize
      );
    }
    if (this.currentLevel === 3) {
      this.humanNewTeams = generateTeam(
        new Team().humanType,
        this.random(1, 2),
        2,
        this.survivor,
        this.gamePlay.boardSize
      );
      this.skyNetNewTeams = generateTeam(
        new Team().skyNetType,
        this.random(1, 3),
        this.humanNewTeams.length,
        this.gamePlay.boardSize
      );
    }
    if (this.currentLevel === 4) {
      this.humanNewTeams = generateTeam(
        new Team().humanType,
        this.random(1, 3),
        2,
        this.survivor,
        this.gamePlay.boardSize
      );
      this.skyNetNewTeams = generateTeam(
        new Team().skyNetType,
        this.random(1, 4),
        this.humanNewTeams.length,
        this.gamePlay.boardSize
      );
    }
    if (this.currentLevel > 4) {
      return;
    }
    // this.generateTeamsPosition(this.humanNewTeams,this.skyNetNewTeams);//если использую это - через раз появляктся ошибка(Uncaught (in promise) Error: position must be a number).
    this.humanPositions = getPositions(
      this.humanNewTeams.length,
      "human",
      this.gamePlay.boardSize
    ); // позиции 'человеков'
    this.skyNetPositions = getPositions(
      this.skyNetNewTeams.length,
      "skyNet",
      this.gamePlay.boardSize
    ); // позиции ботов

    this.humanTeamsWithPos = createTeamWithPos(
      this.humanNewTeams,
      this.humanPositions
    ); // команда человеков с позициями

    this.skyNetTeamsWithPos = createTeamWithPos(
      this.skyNetNewTeams,
      this.skyNetPositions
    );
    // команда ботов с позициями
    this.players = [...this.humanTeamsWithPos, ...this.skyNetTeamsWithPos]; // объединенный массив игроков
    this.humanTurn = true; // ход игрока
    this.gamePlay.redrawPositions(this.players);
  }

  levelUpgrade() {
    switch (this.currentLevel) {
      case 2:
        this.gamePlay.drawUi(themes.desert);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        break;
      default:
        break;
    }
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateTeamsPosition(a, b) {
    this.humanPositions = getPositions(2, "human", this.gamePlay.boardSize); // позиции 'человеков'
    this.skyNetPositions = getPositions(2, "skyNet", this.gamePlay.boardSize); // позиции ботов

    this.humanTeamsWithPos = createTeamWithPos(a, this.humanPositions); // команда человеков с позициями
    this.skyNetTeamsWithPos = createTeamWithPos(b, this.skyNetPositions);
    // команда ботов с позициями
    this.players = [...this.humanTeamsWithPos, ...this.skyNetTeamsWithPos]; // объединенный массив игроков
    console.log(this.players, "players");
    this.humanTurn = true; // ход игрока
    this.gamePlay.redrawPositions(this.players);
  }
}

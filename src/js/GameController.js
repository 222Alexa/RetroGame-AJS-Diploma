/* Я случайно почти все доработала, но вопросы все равно есть)
1.Завершение игры и timeKiller - очищать поле от персонажей или нет
2. кривоватая у меня анимация, если честно, алерт ее блокирует.не придумать как сначала завершить анимацию и удаление игрока, а потом вывести алерт
3. что делать с повышением уровня у ботов, пусть дефолтная атака/защита? или умножать им, если уровень бота выше 1?
4. попытки научить ботов ходить дальше, чем на одну клетку пока безуспешны, хотя атака работает норм
5. изменять  урон в зависимости от дистанции?
6. тесты и сохранение очков после начала новой игры в процессе(это констатация)
7. при игре из сохранения не работает nextLevel(). Видимо, потому что у меня разные обертки для свежих и сохраненных и я пока еще не придумала как это решить
*/
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
import ControlBox from "./ControlBox";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.saveGame = undefined;
    this.char = null;
    this.selectedPlayer = null;
    this.selectedChar = undefined;
    this.currentTurn = "player";
    this.scores = 0;
    this.record = 0;
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
    if (this.saveGame) {
      this.levelUpgrade();
    } else {
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
      this.generateTeamsPosition(this.humanTeams, this.skyNetTeams);
    }

    this.players = [...this.humanTeamsWithPos, ...this.skyNetTeamsWithPos]; // объединенный массив игроков
    this.gamePlay.redrawPositions(this.players);

    this.bindingBoxCount();
    this.controlBox.showCount(this.currentLevel, this.scores, this.record);
  }

  onNewGame() {
    this.char = null;
    this.selectedPlayer = null;
    this.selectedChar = undefined;
    this.players = [];
    this.scores = 0;

    if (this.saveGame) {
      this.saveGame = undefined;
    }

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
      human: this.humanTeamsWithPos,
      skyNet: this.skyNetTeamsWithPos,
      level: this.currentLevel,
      scores: this.scores,
      record: this.record,
      currentTurn: this.currentTurn,
    };

    console.log(this.state);
    this.stateService.save(this.state);
    GamePlay.showMessage("Saved!");
  }

  onLoadGameClick() {
    if (this.state) {
      this.saveGame = this.stateService.load(this.state);
      this.humanTeamsWithPos = this.saveGame.human;
      this.skyNetTeamsWithPos = this.saveGame.skyNet;
      this.currentLevel = this.saveGame.level;
      this.scores = this.saveGame.scores;
      this.record = this.saveGame.record;
      this.players = [];
      this.prepareGame();
      console.log(this.currentLevel, "this.currentLevel");
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
    if (this.saveGame) {
      this.humanTeamsWithPos = this.saveGame.human;
      this.skyNetTeamsWithPos = this.saveGame.skyNet;
    }

    this.skyNetTeamsWithPos = this.filtredHealth(this.skyNetTeamsWithPos);
    this.humanTeamsWithPos = this.filtredHealth(this.humanTeamsWithPos);

    if (!Object.keys(this.skyNetTeamsWithPos).length) {
      this.checkScores(this.humanTeamsWithPos);
      console.log(this.players, "play");
      this.nextLevel(this.players);

      this.levelUpgrade();

      if (this.currentLevel < 5) this.bindingBoxCount();
      this.controlBox.showCount(this.currentLevel, this.scores, this.record);
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
      this.targetSkyNet.position = isEmptyCellsforStepArr[1];

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

    this.humanTeamsWithPos = this.filtredHealth(this.humanTeamsWithPos);
    if (!this.humanTeamsWithPos.length) {
      await this.gameOver(this.humanTeamsWithPos, this.skyNetTeamsWithPos); // alert блокирует анимацию и чистку поля
    } else {
      this.reverseOfTurn();
    }
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

    this.gamePlay.redrawPositions(this.players);
  }

  reverseOfTurn() {
    this.selectedChar = null; // перенести это в endOfTurne

    this.players.forEach((el) => this.gamePlay.deselectCell(el.position)); // перенести это в endOfTurne

    if (this.currentTurn === "player") this.currentTurn = "skyNet";
    else {
      this.currentTurn === "player";
    }
  }

  gameOver(arr1, arr2) {
    if (!arr1.length) {
      alert("You lose!");
    } else if (!arr2.length) {
      alert("You win!");
    }
  }

  finderChar(arr, index) {
    return arr.find((char) => char.position === index);
  }

  filtredHealth(obj) {
    return obj.filter((el) => el.character.health > 0);
  }

  nextLevel(arr) {
    console.log(this.humanTeamsWithPos, "this.humanTeamsWithPos");
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
      this.currentLevel === 4;
      this.gameOver(this.humanTeamsWithPos, this.skyNetTeamsWithPos);
      return;
    }

    this.generateTeamsPosition(this.humanNewTeams, this.skyNetNewTeams);
    this.players = [...this.humanTeamsWithPos, ...this.skyNetTeamsWithPos]; // объединенный массив игроков
    this.gamePlay.redrawPositions(this.players);
  }

  levelUpgrade() {
    switch (this.currentLevel) {
      case 1:
        this.gamePlay.drawUi(themes.prairie);
        break;
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
    this.humanPositions = getPositions(
      a.length,
      "human",
      this.gamePlay.boardSize
    ); // позиции 'человеков'
    this.skyNetPositions = getPositions(
      a.length,
      "skyNet",
      this.gamePlay.boardSize
    ); // позиции ботов

    this.humanTeamsWithPos = createTeamWithPos(a, this.humanPositions); // команда человеков с позициями
    this.skyNetTeamsWithPos = createTeamWithPos(b, this.skyNetPositions);
    this.humanTurn = true; // ход игрока
  }

  checkScores(survivor) {
    const healthArr = [];
    survivor.forEach((el) => {
      healthArr.push(el.character.health);
    });
    const scoresOfLevel = healthArr.reduce((sum, current) => {
      return sum + current;
    }, 0);

    this.scores =
      Number(this.controlBox.boxScoresEl.textContent) + scoresOfLevel;

    if (this.record < this.scores) this.record = this.scores;
    this.controlBox.showCount(this.currentLevel, this.scores, this.record);
  }

  bindingBoxCount() {
    this.controlBox = new ControlBox(
      document.querySelector(".board-container")
    );
    this.controlBox.redrawControlBox();
  }
}

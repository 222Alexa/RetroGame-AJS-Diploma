import Bowman from "./CharacterList/Bowman";
import Daemon from "./CharacterList/Daemon";
import Magician from "./CharacterList/Magician";
import Swordsman from "./CharacterList/Swordsman";
import Undead from "./CharacterList/Undead";
import Vampire from "./CharacterList/Vampire";

export default class Team {
  constructor(heroes) {
    this.humanType = [Bowman, Swordsman, Magician];
    this.skyNetType = [Daemon, Vampire, Undead];
  }
}
// const humanTeams = generateTeam(new Team().humanType,1,2, this.gamePlay.boardSize);
// const skyNetTeams = generateTeam(new Team().skyNetType,1,2, this.gamePlay.boardSize)
//

//

// let humanPositions = getPositions(characterCount, 'human', boardSize = 8);// позиции человеков
// let skyNetPositions = getPositions(characterCount, 'skyNet', boardSize = 8)// позиции ботов

// let humanTeamsWithpos = createTeamWithPos(humanTeams, humanPositions); // команда человеков с позициями
// let skyNetTeamsWithpos = createTeamWithPos(skyNetTeams, skyNetPositions);/ команда ботов с позициями
// let players = [...humanTeamsWithpos,skyNetTeamsWithpos]// объединенный массив игроков

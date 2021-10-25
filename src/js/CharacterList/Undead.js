import Character from "./Character";

export default class Undead extends Character {
  constructor(...attrs) {
    super(...attrs);
    this.attack = 40;
    this.deffence = 10;
    this.type = "undead";
  }
}

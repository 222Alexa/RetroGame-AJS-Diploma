import Character from "./Character";

export default class Daemon extends Character {
  constructor(...attrs) {
    super(...attrs);
    this.attack = 10;
    this.deffence = 40;
    this.type = "daemon";
  }
}

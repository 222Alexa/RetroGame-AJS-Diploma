export default class Character {
  constructor(level, type = "generic") {
    this.level = level;
    this.attack = 0;
    this.deffence = 0;
    this.health = 100;

    // TODO: throw error if user use "new Character()"
    if (new.target.name === "Character") {
      throw new Error("You cannot create instances of the Character class");
    }
  }

  levelUp() {
    this.level += 1;
    this.health += 80;
    if (this.health > 100) {
      this.health = 100;
    }
    this.attack = Math.max(
      this.attack,
      (this.attack * (180 - this.health)) / 100
    ); // не работает изменение атаки и защиты
    this.deffence = Math.max(
      this.deffence,
      (this.deffence * (180 - this.health)) / 100
    );
  }

  /* damage(points) {
      if (this.health > 0) {
        this.health -= points * (1 - this.deffence / 100);
        // console.log('Не сегодня!');
      }
      if (this.health < 0) {
        this.health = 0;
        // console.log('Game over!');
      }
    } */
}

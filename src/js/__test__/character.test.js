import Character from "../CharacterList/Character";
import Bowman from "../CharacterList/Bowman";
import Daemon from "../CharacterList/Daemon";
import Magician from "../CharacterList/Magician";
import Swordsman from "../CharacterList/Swordsman";
import Undead from "../CharacterList/Undead";
import Vampire from "../CharacterList/Vampire";

test("Невозможно создать экземпляры класса характер", () => {
  expect(() => {
    const result = new Character(1, "Bowman");
    return result;
  }).toThrow();
});

test("creation Daemon", () => {
  const recieved = new Daemon(2, "Daemon");
  expect(recieved).toEqual({
    type: "daemon",
    health: 100,
    level: 2,
    attack: 10,
    deffence: 40,
  });
});
test("creation Magician", () => {
  const recieved = new Magician(1, "Magician");
  expect(recieved).toEqual({
    type: "magician",
    health: 100,
    level: 1,
    attack: 10,
    deffence: 40,
  });
});
test("creation Swordsman", () => {
  const recieved = new Swordsman(1, "Swordsman");
  expect(recieved).toEqual({
    type: "swordsman",
    health: 100,
    level: 1,
    attack: 40,
    deffence: 10,
  });
});
test("creation Undead", () => {
  const recieved = new Undead(2, "Undead");
  expect(recieved).toEqual({
    type: "undead",
    health: 100,
    level: 2,
    attack: 40,
    deffence: 10,
  });
});
test("creation Vampire", () => {
  const recieved = new Vampire(2, "Vampire");
  expect(recieved).toEqual({
    type: "vampire",
    health: 100,
    level: 2,
    attack: 25,
    deffence: 25,
  });
});

test("levelUp() корректно повышает уровень и health", () => {
  const recieved = new Bowman(2, "Bowman");
  recieved.health = 30;
  recieved.levelUp();
  expect(recieved).toEqual({
    type: "bowman",
    health: 100,
    level: 3,
    attack: 38,
    deffence: 38,
  });
});

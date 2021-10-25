// функция проверки возможности перехода на ячейку
export function isPosibleStep(charType, a, b) {
  let radiusStep = 0;
  const stepX = Math.abs(Math.floor(a / 8) - Math.floor(b / 8));
  const stepY = Math.abs((a % 8) - (b % 8));

  switch (charType) {
    case "magician":
    case "daemon":
      radiusStep = 1;
      break;
    case "bowman":
    case "vampire":
      radiusStep = 2;
      break;
    case "swordsman":
    case "undead":
      radiusStep = 4;
      break;
    default:
      break;
  }

  return Math.max(stepX, stepY) <= radiusStep;
}

// функция проверки возможности атаки

export function isPosibleAttack(charType, a, b) {
  let radiusAttack = 0;
  const attackY = Math.abs(Math.floor(a / 8) - Math.floor(b / 8));
  const attackX = Math.abs((a % 8) - (b % 8));

  switch (charType) {
    case "magician":
    case "daemon":
      radiusAttack = 4;
      break;
    case "bowman":
    case "vampire":
      radiusAttack = 2;
      break;
    case "swordsman":
    case "undead":
      radiusAttack = 1;
      break;
    default:
      break;
  }

  return Math.max(attackY, attackX) <= radiusAttack;
}

export function isRadius(сurrentIndex, targetIndex) {
  const radiusX = Math.abs(
    Math.floor(сurrentIndex / 8) - Math.floor(targetIndex / 8)
  );
  const radiusY = Math.abs((сurrentIndex % 8) - (targetIndex % 8));
  const radius = Math.max(radiusX, radiusY);
  return radius;
}

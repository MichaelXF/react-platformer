export function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInteger(min, max) {
  return Math.floor(getRandom(min, max));
}

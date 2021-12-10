export function getDistance(x1, y1, x2, y2) {
  let y = x2 - x1;
  let x = y2 - y1;

  return Math.sqrt(x * x + y * y);
}

export function degreesToRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

export function radiansToDegree(radians) {
  return radians * (180 / Math.PI);
}

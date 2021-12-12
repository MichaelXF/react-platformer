export default class Animation {
  constructor({
    sprite,
    frames,
    speed,
    after,
    xOffset,
    yOffset,
    disableController,
    idle,
    size,
    timeout,
  }) {
    this.sprite = sprite;
    this.frames = frames;
    this.speed = speed;

    this.after = after;

    this.disableController = !!disableController;

    this.xOffset = xOffset || 0;
    this.yOffset = yOffset || 0;

    this.idle = !!idle;
    this.size = size;

    this.timeout = timeout;
  }
}

// B"H

/**
 * CameraRig is the quiet eye of the ladder.
 *
 * The Awtsmoos lets sight become mercy: death freezes the exact shatter place,
 * but rebirth must not inherit the broken gaze. This rig gives the renderer a
 * small, testable chamber for camera math: horizontal follow, vertical dead-zone
 * follow, and a precise snap after failure.
 */
export class CameraRig {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Updates both camera axes for the current frame.
   *
   * @param {object} world current physics world.
   * @param {{width:number,height:number}} view logical canvas size.
   * @returns {{x:number,y:number}} the camera position to use for drawing.
   */
  update(world, view) {
    this.x = this.nextX(world, view);
    this.y = this.nextY(world, view);
    return { x: this.x, y: this.y };
  }

  nextX(world, view) {
    if (world.deathPause?.cameraX !== undefined) return world.deathPause.cameraX;
    const visibleWidth = Math.max(360, view.width);
    const lead = Math.max(180, Math.min(430, visibleWidth * 0.44));
    return Math.max(0, Math.min(Math.max(0, world.width - visibleWidth), world.player.x - lead));
  }

  nextY(world, view) {
    if (world.deathPause?.cameraY !== undefined) return world.deathPause.cameraY;
    if (world.cameraResetAfterDeath) {
      world.cameraResetAfterDeath = false;
      return this.respawnY(world, view);
    }
    const band = this.deadZone(view);
    const playerBottom = world.player.y + world.player.h;
    const screenBottom = playerBottom - this.y;
    let next = this.y;
    if (screenBottom < band.upper) next = playerBottom - band.upper;
    else if (screenBottom > band.lower) next = playerBottom - band.lower;
    return this.clampY(next);
  }

  respawnY(world, view) {
    const band = this.deadZone(view);
    return this.clampY(world.player.y + world.player.h - band.lower);
  }

  deadZone(view) {
    const lowTarget = view.width < 720 ? view.height * 0.66 : view.height * 0.78;
    return { upper: lowTarget - (view.width < 720 ? 130 : 220), lower: lowTarget + 34 };
  }

  clampY(value) {
    return Math.max(-360, Math.min(220, value));
  }
}

// B"H

/**
 * CameraRig is the quiet eye of the ladder.
 *
 * The Awtsmoos does not stop looking when the player climbs above the first
 * heavens. Earlier, the eye was clamped too low, so upper adventures could be
 * reached while the camera refused to rise. Now the vertical limit is derived
 * from real level geometry and player height, letting the gaze follow every
 * reachable sky route without drifting into empty infinity.
 */
export class CameraRig {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Updates both camera axes for the current frame.
   * @param {object} world current physics world.
   * @param {{width:number,height:number}} view logical canvas size.
   * @returns {{x:number,y:number}} camera position.
   */
  update(world, view) {
    this.x = this.nextX(world, view);
    this.y = this.nextY(world, view);
    return { x: this.x, y: this.y };
  }

  /** @param {object} world world @param {object} view view */
  nextX(world, view) {
    if (world.deathPause?.cameraX !== undefined) return world.deathPause.cameraX;
    const visibleWidth = Math.max(360, view.width);
    const lead = Math.max(180, Math.min(430, visibleWidth * 0.44));
    return Math.max(0, Math.min(Math.max(0, world.width - visibleWidth), world.player.x - lead));
  }

  /** @param {object} world world @param {object} view view */
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
    return this.clampY(next, world, view);
  }

  /** @param {object} world world @param {object} view view */
  respawnY(world, view) {
    const band = this.deadZone(view);
    return this.clampY(world.player.y + world.player.h - band.lower, world, view);
  }

  /** @param {{width:number,height:number}} view logical canvas size */
  deadZone(view) {
    const lowTarget = view.width < 720 ? view.height * 0.66 : view.height * 0.78;
    return { upper: lowTarget - (view.width < 720 ? 155 : 240), lower: lowTarget + 34 };
  }

  /** @param {number} value proposed y @param {object} world world @param {object} view view */
  clampY(value, world, view) {
    const top = this.levelTop(world) - Math.max(96, view.height * 0.2);
    const bottom = Math.max(220, (world.level?.groundY || 540) - view.height * 0.58);
    return Math.max(top, Math.min(bottom, value));
  }

  /**
   * Finds the highest meaningful thing in the current chamber.
   * @param {object} world current world.
   * @returns {number} highest y coordinate to keep visible.
   */
  levelTop(world) {
    const candidates = [world.player?.y || 0];
    for (const list of [
      world.level?.platforms,
      world.level?.trickPlatforms,
      world.level?.rotatingPlatforms,
      world.level?.spikes,
      world.level?.coins,
      world.level?.fakeCoins,
      world.level?.keys,
      world.level?.triggers
    ]) {
      for (const item of list || []) if (Number.isFinite(item.y)) candidates.push(item.y);
    }
    return Math.min(...candidates, -560);
  }
}

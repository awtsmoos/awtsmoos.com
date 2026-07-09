// B"H
/** JumpPhysics: higher leap, honest fall, and slide when the slope is too steep. */
export class JumpPhysics {
  constructor({ ground, footOffset, impulse = 6.25, gravity = 13.7, maxSlopeNormal = .72 }) { Object.assign(this, { ground, footOffset, impulse, gravity, maxSlopeNormal }); }
  update(state, dt, jumpQueued) {
    const sample = this.ground.sample(state.x, state.z), floorY = sample.height + this.footOffset;
    state.groundKind = sample.kind; state.groundNormal = sample.normal; state.grounded = state.y <= floorY + .06 && state.velY <= .03;
    if (state.grounded) { state.y = floorY; state.velY = 0; state.airPhase = 'ground'; }
    if (jumpQueued && state.grounded) { state.velY = this.impulse; state.grounded = false; state.airPhase = 'jump'; state.jumpClock = 0; state.slopeState = 'jump'; }
    if (!state.grounded) return this.air(state, dt);
    return this.slide(state, sample, dt);
  }
  air(state, dt) {
    state.jumpClock += dt; state.velY -= this.gravity * dt; state.y += state.velY * dt;
    const floorY = this.ground.heightAt(state.x, state.z) + this.footOffset;
    state.airPhase = state.velY >= -.25 && state.jumpClock < .40 ? 'jump' : 'fall';
    if (state.y <= floorY) { state.y = floorY; state.velY = 0; state.grounded = true; state.airPhase = 'ground'; }
    return { slide: null };
  }
  slide(state, sample, dt) {
    const n = sample.normal || { x:0, y:1, z:0 }, steep = n.y < this.maxSlopeNormal && n.y > .18, mag = Math.hypot(n.x, n.z);
    state.slopeState = steep ? 'slide' : 'walk'; if (!steep || mag < .001) return { slide: null };
    const speed = (this.maxSlopeNormal - n.y) * 10 + 1.1;
    return { slide: { x: n.x / mag * speed * dt, z: n.z / mag * speed * dt } };
  }
}

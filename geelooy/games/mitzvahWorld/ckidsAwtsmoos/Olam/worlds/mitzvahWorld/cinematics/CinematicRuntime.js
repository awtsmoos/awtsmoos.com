/**
 * B"H
 * Chapter 43: The Camera Bowed Before The Moment.
 */

export class CinematicRuntime {
  constructor(beats = {}) {
    this.beats = beats;
    this.played = [];
  }

  play(id, context = {}) {
    const beat = this.beats[id];
    if (!beat) throw new Error(`Unknown cinematic beat: ${id}`);
    const record = { id, camera: beat.camera || 'default', context };
    this.played.push(record);
    return record;
  }

  history() {
    return [...this.played];
  }
}

export default CinematicRuntime;

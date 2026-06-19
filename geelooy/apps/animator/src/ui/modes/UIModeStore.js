// B"H

/**
 * @file UIModeStore.js
 * @description
 * Playback, edit, and inspect modes so UI stops covering the movie.
 */
export class UIModeStore {
  constructor() {
    this.mode = 'playback';
  }

  set(mode) {
    this.mode = ['playback', 'edit', 'inspect'].includes(mode) ? mode : 'playback';
    document.documentElement.dataset.awMode = this.mode;
  }

  get() {
    return this.mode;
  }

  toggleEdit() {
    this.set(this.mode === 'edit' ? 'playback' : 'edit');
  }
}
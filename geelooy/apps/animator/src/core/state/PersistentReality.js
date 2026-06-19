// B"H
import { AutosavePinger } from '../ui/autosave/AutosavePinger.js';

/**
 * @file PersistentReality.js
 * @description
 * Chapter: The Reshimu learned version and humility.
 * Old saved sequences can resurrect broken cameras and frozen walks. Persistence
 * now stores a versioned envelope and refuses to revive stale demo state.
 */
export class PersistentReality {
  static KEY = 'AWTSMOOS_RESHIMU_V2';
  static LEGACY_KEY = 'AWTSMOOS_RESHIMU_V1';
  static VERSION = 'cinematic-walk-closeup-v3';
  static saveTimeout = null;

  /** @param {Object} state - State manager. @returns {void} */
  static bind(state) {
    const scheduleSave = () => {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.save(state), 1000);
    };
    state.subscribe('activeSequence', scheduleSave);
    state.subscribe('characters', scheduleSave);
  }

  /** @param {Object} state - State manager. @returns {void} */
  static save(state) {
    try {
      const payload = {
        version: this.VERSION,
        sequence: state.get('activeSequence'),
        characters: state.get('characters')
      };
      if (payload.sequence) localStorage.setItem(this.KEY, JSON.stringify(payload));
      AutosavePinger.ping();
    } catch (err) {
      console.info('B"H - Reshimu save skipped.', err?.message || err);
    }
  }

  /** @returns {Object|null} Saved sequence. */
  static resurrect() {
    const payload = this.readPayload();
    return payload?.sequence || null;
  }

  /** @returns {Object|null} Saved characters. */
  static resurrectCharacters() {
    const payload = this.readPayload();
    return payload?.characters || null;
  }

  /** @returns {Object|null} Versioned payload. */
  static readPayload() {
    try {
      const saved = localStorage.getItem(this.KEY);
      if (!saved) return null;
      const payload = JSON.parse(saved);
      if (payload?.version !== this.VERSION) return null;
      return payload;
    } catch (_err) {
      return null;
    }
  }

  /** @returns {void} */
  static obliterate() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.LEGACY_KEY);
    localStorage.removeItem(this.LEGACY_KEY + '_CHARS');
  }
}

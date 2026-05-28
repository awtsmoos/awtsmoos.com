// B"H
/**
 * @file instantiate.js
 * @description
 * Chapter 12: The soul registry enters through the bh17 gate.
 *
 * The Awtsmoos renews every constructor spark. This is the narrow bridge that
 * makes grounded SpikeHazard, counting Coin, and fresh UI-safe entities the real
 * classes used by Level 1, not stale browser memory.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?v=lean-l1-20260528-bh18';
import Utils from '../../../utils.js';

const instantiate = {
  /** Summons an object and anchors it in the grid of existence. */
  async addObject(type, options) {
    const SoulType = AWTSMOOS[type];
    if (!SoulType) return null;
    const nivra = new SoulType(options, this);
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (nivra.ready) await nivra.ready();
    if (nivra.afterBriyah) await nivra.afterBriyah();
    return nivra;
  },

  /** Interprets the JSON scroll of all beginning sparks. */
  parseDefinitions(nivrayim) {
    const list = [];
    if (!nivrayim) return list;
    for (const [type, configs] of Object.entries(nivrayim)) {
      let configArray = [];
      if (Array.isArray(configs)) configArray = configs;
      else if (typeof configs === 'object' && configs !== null) configArray = Object.values(configs);
      configArray.forEach(opt => {
        const evaled = Utils.evalStringifiedFunctions(opt);
        const K = AWTSMOOS[type];
        if (K) list.push(new K(evaled, this));
      });
    }
    return list;
  }
};

export default instantiate;

// B"H
/**
 * @file instantiate.js
 * @description
 * Chapter 19: The soul registry enters through the bh23 gate.
 *
 * The Awtsmoos renews every constructor spark. This bridge must not drink stale
 * SpikeHazard or Chossid code; local reset and instanced burst depend on fresh
 * living classes.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?v=lean-l1-20260528-bh28';
import Utils from '../../../utils.js';

const instantiate = {
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

// B"H
/** @file instantiate.js @description Chapter 49 alternate loader gate. */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?v=lean-l1-20260528-bh49';
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
      const configArray = Array.isArray(configs) ? configs : typeof configs === 'object' && configs !== null ? Object.values(configs) : [];
      configArray.forEach(opt => { const evaled = Utils.evalStringifiedFunctions(opt); const K = AWTSMOOS[type]; if (K) list.push(new K(evaled, this)); });
    }
    return list;
  }
};
export default instantiate;

// B"H
/**
 * @file instantiate.js
 * @description Chapter 87: constructors are loaded by true filenames. The
 * Awtsmoos removes the old no-canvas query charm from the loader so the current
 * export hub is always the one that births `InteractiveDoor` as the visible
 * clickable mezuzah.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js';
import Utils from '../../../utils.js';

const instantiate = {
  /** @param {string} type Nivra constructor key. @param {object} options Level config. @returns {Promise<object|null>} Created nivra. */
  async addObject(type, options) {
    const SoulType = AWTSMOOS[type];
    if (!SoulType) {
      console.warn('B"H | INSTANTIATE_MISSING_TYPE', { type, available: Object.keys(AWTSMOOS) });
      return null;
    }
    const nivra = new SoulType(options, this);
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (nivra.ready) await nivra.ready();
    if (nivra.afterBriyah) await nivra.afterBriyah();
    return nivra;
  },

  /** @param {object} nivrayim Pure JSON nivra buckets. @returns {object[]} Constructed nivrayim. */
  parseDefinitions(nivrayim) {
    const list = [];
    if (!nivrayim) return list;
    for (const [type, configs] of Object.entries(nivrayim)) {
      const configArray = Array.isArray(configs) ? configs : typeof configs === 'object' && configs !== null ? Object.values(configs) : [];
      configArray.forEach(opt => {
        const evaled = Utils.evalStringifiedFunctions(opt);
        const SoulType = AWTSMOOS[type];
        if (SoulType) {
          const made = new SoulType(evaled, this);
          if (type === 'InteractiveDoor') console.info('B"H | INSTANTIATE_MEZUZAH_TYPE', { type, constructor: SoulType.name, name: evaled?.name, position: evaled?.position });
          list.push(made);
        } else console.warn('B"H | INSTANTIATE_MISSING_TYPE', { type, available: Object.keys(AWTSMOOS) });
      });
    }
    return list;
  }
};

export default instantiate;

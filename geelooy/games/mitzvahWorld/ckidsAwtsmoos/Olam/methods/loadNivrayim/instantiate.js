// B"H
/**
 * @file instantiate.js
 * @description Chapter 93: the mezuzah no longer depends on a stale export
 * river. The Awtsmoos revealed the live worker had no `InteractiveDoor` export,
 * so this loader now carries the doorway class directly and logs every gate
 * birth with position, constructor, and registration intent.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import Utils from '../../../utils.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

function resolveSoulType(type) {
  if (type === 'InteractiveDoor') return InteractiveDoorDirect;
  return AWTSMOOS[type] || null;
}

function logMissing(type) {
  console.warn('B"H | INSTANTIATE_MISSING_TYPE', { type, available: Object.keys(AWTSMOOS), hasDirectInteractiveDoor: Boolean(InteractiveDoorDirect) });
}

function logMezuzah(stage, data = {}) {
  if (globalThis.__AWTSMOOS_DOOR_LOGS__ === true) console.info('B"H | MEZUZAH_INSTANTIATE_DIRECT', { stage, ...data });
}

function makeNivra(context, type, options) {
  const SoulType = resolveSoulType(type);
  if (!SoulType) {
    logMissing(type);
    return null;
  }
  if (type === 'InteractiveDoor') logMezuzah('constructor-selected', { constructor: SoulType.name, name: options?.name, position: options?.position, next: options?.next });
  return new SoulType(options, context);
}

const instantiate = {
  /** @param {string} type Constructor key. @param {object} options Level config. @returns {Promise<object|null>} Created nivra. */
  async addObject(type, options) {
    const nivra = makeNivra(this, type, options);
    if (!nivra) return null;
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (type === 'InteractiveDoor') logMezuzah('heescheel-finished', { name: nivra.name, hasMesh: Boolean(nivra.mesh), interactableCount: this.interactableNivrayim?.length, sceneChildren: this.scene?.children?.length });
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
        const made = makeNivra(this, type, evaled);
        if (!made) return;
        if (type === 'InteractiveDoor') logMezuzah('definition-created', { constructor: made.constructor?.name, name: evaled?.name, position: evaled?.position, next: evaled?.next });
        list.push(made);
      });
    }
    return list;
  }
};

export default instantiate;

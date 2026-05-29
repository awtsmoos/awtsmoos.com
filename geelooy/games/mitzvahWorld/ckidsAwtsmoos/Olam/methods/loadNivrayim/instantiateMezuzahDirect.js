// B"H
/**
 * @file instantiateMezuzahDirect.js
 * @description Chapter 94: a fresh loader vessel for the most important gate.
 * The Awtsmoos bypasses stale public `instantiate.js` and stale export hubs by
 * importing `SimpleDoor.js` directly for JSON `InteractiveDoor` entries. Every
 * step logs loudly so the console says whether the mezuzah was created, added,
 * registered, and made visible.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js';
import Utils from '../../../utils.js';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js';

function resolveSoulType(type) {
  return type === 'InteractiveDoor' ? InteractiveDoorDirect : AWTSMOOS[type] || null;
}

function logMezuzah(stage, data = {}) {
  console.info('B"H | MEZUZAH_INSTANTIATE_DIRECT', { stage, ...data });
}

function logMissing(type) {
  console.warn('B"H | INSTANTIATE_MISSING_TYPE', { type, available: Object.keys(AWTSMOOS), hasDirectInteractiveDoor: Boolean(InteractiveDoorDirect) });
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

const instantiateMezuzahDirect = {
  async addObject(type, options) {
    const nivra = makeNivra(this, type, options);
    if (!nivra) return null;
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (type === 'InteractiveDoor') logMezuzah('heescheel-finished', { name: nivra.name, hasMesh: Boolean(nivra.mesh), meshName: nivra.mesh?.name, interactableCount: this.interactableNivrayim?.length, mezuzahRegistryCount: this.__insideRightPostMezuzahs?.length });
    if (nivra.ready) await nivra.ready();
    if (nivra.afterBriyah) await nivra.afterBriyah();
    return nivra;
  },

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

export default instantiateMezuzahDirect;

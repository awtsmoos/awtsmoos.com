// B"H
/**
 * @file instantiateMezuzahDirect.js
 * @description
 * Chapter 110: The guide and the door are no longer at the mercy of stale hubs.
 * The loader imports both critical interaction souls directly. If export hubs lag
 * in Android cache, `InteractiveNpc` still constructs and the guide appears.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js';
import Utils from '../../../utils.js';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js';
import InteractiveNpcDirect from '../../../dvarim/npc/InteractiveNpc.js?v=visible-guide-direct-20260604-bh442';

function resolveSoulType(type) {
  if (type === 'InteractiveDoor') return InteractiveDoorDirect;
  if (type === 'InteractiveNpc') return InteractiveNpcDirect;
  return AWTSMOOS[type] || null;
}

function logSpecial(stage, data = {}) {
  console.info('B"H | DIRECT_INTERACTION_INSTANTIATE', { stage, ...data });
}

function logMissing(type) {
  console.warn('B"H | INSTANTIATE_MISSING_TYPE', {
    type,
    available: Object.keys(AWTSMOOS),
    hasDirectInteractiveDoor: Boolean(InteractiveDoorDirect),
    hasDirectInteractiveNpc: Boolean(InteractiveNpcDirect)
  });
}

function makeNivra(context, type, options) {
  const SoulType = resolveSoulType(type);
  if (!SoulType) {
    logMissing(type);
    return null;
  }
  if (type === 'InteractiveDoor' || type === 'InteractiveNpc') logSpecial('constructor-selected', { type, constructor: SoulType.name, name: options?.name, position: options?.position });
  return new SoulType(options, context);
}

const instantiateMezuzahDirect = {
  async addObject(type, options) {
    const nivra = makeNivra(this, type, options);
    if (!nivra) return null;
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (type === 'InteractiveDoor' || type === 'InteractiveNpc') logSpecial('heescheel-finished', { type, name: nivra.name, hasMesh: Boolean(nivra.mesh), meshName: nivra.mesh?.name, interactableCount: this.interactableNivrayim?.length });
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
        if (type === 'InteractiveDoor' || type === 'InteractiveNpc') logSpecial('definition-created', { type, constructor: made.constructor?.name, name: evaled?.name, position: evaled?.position });
        list.push(made);
      });
    }
    return list;
  }
};

export default instantiateMezuzahDirect;

// B"H
/**
 * @file instantiateMezuzahDirect.js
 * @description
 * Chapter 613: The lava platforms no longer depend on the stale export river.
 *
 * Android devtools showed `INSTANTIATE_MISSING_TYPE` for SolidBlock while the
 * lava level had only coins, lava, and a white fallback chossid cube. This
 * loader now carries direct imports for the core platform/hazard classes that
 * ladder JSON needs every time, even when AWTSMOOS exports are cached or stale.
 */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js';
import Utils from '../../../utils.js';
import SolidBlockDirect from '../../../dvarim/architecture/SolidBlock.js?v=direct-lava-platforms-20260609-bh613';
import MovingPlatformDirect from '../../../dvarim/hazards/MovingPlatform.js?v=direct-lava-platforms-20260609-bh613';
import SpikeFieldDirect from '../../../dvarim/hazards/SpikeField.js?v=direct-lava-platforms-20260609-bh613';
import FallResetTriggerDirect from '../../../dvarim/hazards/FallResetTrigger.js?v=direct-lava-platforms-20260609-bh613';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js?v=direct-lava-platforms-20260609-bh613';
import InteractiveNpcDirect from '../../../dvarim/npc/InteractiveNpc.js?v=travel-ui-buttons-fixed-20260609-bh566';
const DIRECT_TYPES = {
  SolidBlock: SolidBlockDirect,
  MovingPlatform: MovingPlatformDirect,
  SpikeField: SpikeFieldDirect,
  FallResetTrigger: FallResetTriggerDirect,
  InteractiveDoor: InteractiveDoorDirect,
  InteractiveNpc: InteractiveNpcDirect
};
function resolveSoulType(type) { return DIRECT_TYPES[type] || AWTSMOOS[type] || null; }
function logSpecial(stage, data = {}) { console.info('B"H | DIRECT_RUNTIME_INSTANTIATE', { stage, ...data }); }
function logMissing(type) { console.warn('B"H | INSTANTIATE_MISSING_TYPE', { type, directKnown: Object.keys(DIRECT_TYPES), available: Object.keys(AWTSMOOS) }); }
function makeNivra(context, type, options) {
  const SoulType = resolveSoulType(type);
  if (!SoulType) { logMissing(type); return null; }
  if (DIRECT_TYPES[type]) logSpecial('constructor-selected', { type, constructor: SoulType.name, name: options?.name, position: options?.position });
  return new SoulType(options, context);
}
const instantiateMezuzahDirect = {
  async addObject(type, options) {
    const nivra = makeNivra(this, type, options);
    if (!nivra) return null;
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (DIRECT_TYPES[type]) logSpecial('heescheel-finished', { type, name: nivra.name, hasMesh: Boolean(nivra.mesh), meshName: nivra.mesh?.name, interactableCount: this.interactableNivrayim?.length });
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
        if (DIRECT_TYPES[type]) logSpecial('definition-created', { type, constructor: made.constructor?.name, name: evaled?.name, position: evaled?.position });
        list.push(made);
      });
    }
    return list;
  }
};
export default instantiateMezuzahDirect;

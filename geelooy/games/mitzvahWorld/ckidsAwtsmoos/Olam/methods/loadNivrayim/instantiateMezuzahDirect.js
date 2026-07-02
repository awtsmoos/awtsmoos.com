// B"H
/** @file instantiateMezuzahDirect.js @description Direct constructors with bh9 Chossid. */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?v=no-compact-engine-20260702-bh2';
import Utils from '../../../utils.js';
import ChossidDirect from '../../../chayim/chossid/index.js?v=no-compact-engine-20260702-bh2';
import SolidBlockDirect from '../../../dvarim/architecture/SolidBlock.js?v=direct-lava-platforms-20260609-bh620';
import MovingPlatformDirect from '../../../dvarim/hazards/MovingPlatform.js?v=direct-lava-platforms-20260609-bh620';
import SpikeFieldDirect from '../../../dvarim/hazards/SpikeField.js?v=lava-camera-axis-20260609-bh640';
import FallResetTriggerDirect from '../../../dvarim/hazards/FallResetTrigger.js?v=lava-camera-axis-20260609-bh640';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js?v=route-alias-targetpath-20260609-bh620';
import InteractiveNpcDirect from '../../../dvarim/npc/InteractiveNpc.js?v=zone-reality-20260614-bh817';
const DIRECT_TYPES = { Chossid:ChossidDirect, SolidBlock:SolidBlockDirect, MovingPlatform:MovingPlatformDirect, SpikeField:SpikeFieldDirect, FallResetTrigger:FallResetTriggerDirect, InteractiveDoor:InteractiveDoorDirect, InteractiveNpc:InteractiveNpcDirect };
function resolveSoulType(type) { return DIRECT_TYPES[type] || AWTSMOOS[type] || null; }
function auditEnabled() { return globalThis.__AWTSMOOS_INSTANTIATION_AUDIT__ === true; }
function logSpecial(stage, data = {}) { if (auditEnabled()) console.debug('B"H | DIRECT_RUNTIME_INSTANTIATE', { stage, ...data }); }
function logMissing(type) { if (auditEnabled()) console.debug('B"H | INSTANTIATE_MISSING_TYPE', { type, directKnown:Object.keys(DIRECT_TYPES), available:Object.keys(AWTSMOOS) }); }
function makeNivra(context, type, options) { const SoulType = resolveSoulType(type); if (!SoulType) { logMissing(type); return null; } if (DIRECT_TYPES[type]) logSpecial('constructor-selected', { type, constructor:SoulType.name, name:options?.name, position:options?.position }); return new SoulType(options, context); }
const instantiateMezuzahDirect = { async addObject(type, options) { const nivra = makeNivra(this, type, options); if (!nivra) return null; if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra); if (nivra.heescheel) await nivra.heescheel(this); if (DIRECT_TYPES[type]) logSpecial('heescheel-finished', { type, name:nivra.name, hasMesh:Boolean(nivra.mesh), meshName:nivra.mesh?.name, interactableCount:this.interactableNivrayim?.length }); if (nivra.ready) await nivra.ready(); if (nivra.afterBriyah) await nivra.afterBriyah(); return nivra; }, parseDefinitions(nivrayim) { const list = []; if (!nivrayim) return list; for (const [type, configs] of Object.entries(nivrayim)) { const configArray = Array.isArray(configs) ? configs : typeof configs === 'object' && configs !== null ? Object.values(configs) : []; configArray.forEach(opt => { const evaled = Utils.evalStringifiedFunctions(opt), made = makeNivra(this, type, evaled); if (!made) return; if (DIRECT_TYPES[type]) logSpecial('definition-created', { type, constructor:made.constructor?.name, name:evaled?.name, position:evaled?.position }); list.push(made); }); } return list; } };
export default instantiateMezuzahDirect;

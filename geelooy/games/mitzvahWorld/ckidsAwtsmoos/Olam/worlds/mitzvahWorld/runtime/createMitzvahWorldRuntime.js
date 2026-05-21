/**
 * B"H
 * Chapter 52: The Runtime Opened Its Eyes.
 */

import { RuntimeActionBus } from './RuntimeActionBus.js';
import { RuntimeStateStore } from './RuntimeStateStore.js';
import { DoorTransitionRuntime } from '../doors/DoorTransitionRuntime.js';
import { InteriorStreamingRuntime } from '../interiors/InteriorStreamingRuntime.js';
import { RuntimeDiagnosticsOverlay } from '../diagnostics/RuntimeDiagnosticsOverlay.js';
import { TorahEnergyOverlayRuntime } from '../effects/TorahEnergyOverlayRuntime.js';
import { RuntimeInventoryAdapter } from './RuntimeInventoryAdapter.js';
import { RuntimeQuestAdapter } from './RuntimeQuestAdapter.js';
import { NpcInteractionRuntime } from '../npcs/NpcInteractionRuntime.js';
import { ChumashReaderController } from '../debate/ChumashReaderController.js';
import { TorahDebateController } from '../debate/TorahDebateController.js';
import { RuntimeActionBar } from './RuntimeActionBar.js';
import { STARTING_CHUMASH_ITEM } from '../data/manifests/ChumashPassages.js';

export function createMitzvahWorldRuntime(config = {}) {
  const bus = new RuntimeActionBus();
  const store = new RuntimeStateStore(config.initialState || {});
  const diagnostics = new RuntimeDiagnosticsOverlay();

  const systems = {
    bus,
    store,
    diagnostics,
    doors: new DoorTransitionRuntime(),
    interiors: new InteriorStreamingRuntime(config.interiors || {}),
    torahEnergy: new TorahEnergyOverlayRuntime(),
    inventory: new RuntimeInventoryAdapter(store),
    quests: new RuntimeQuestAdapter(store),
    npcInteractions: new NpcInteractionRuntime(),
    chumashReader: new ChumashReaderController(),
    torahDebate: new TorahDebateController(),
    actionBar: new RuntimeActionBar()
  };

  bus.on('openDoor', event => {
    const result = systems.doors.openDoor(event.payload.door, event.payload.player);
    store.set(`doors.${event.payload.door.name}.isOpen`, Boolean(result.ok));
  });

  bus.on('bless', event => systems.torahEnergy.bless(event.payload.targetId, event.payload.intensity));

  bus.on('collectItem', event => {
    systems.inventory.add(event.payload.itemId, event.payload.qty || 1);
    systems.quests.progress('collect', event.payload.itemId, event.payload.qty || 1);
  });

  bus.on('npcInteract', event => {
    const result = systems.npcInteractions.interact(event.payload.npc);
    store.set('lastNpcInteraction', result);
  });

  bus.on('openChumash', event => {
    const item = { ...STARTING_CHUMASH_ITEM, ...(event.payload.item || {}) };
    const state = systems.chumashReader.openBook(item);
    store.set('chumash.passagesVisible', state.passages.length);
  });

  bus.on('openTorahDebate', event => {
    const state = systems.torahDebate.open(event.payload.deckId, event.payload.player || null);
    store.set('torahDebate.deckId', state.deckId);
  });

  bus.on('bindActionSlot', event => {
    systems.actionBar.bind(event.payload.slot, event.payload.action, event.payload.payload || {});
    store.set(`actionBar.${event.payload.slot}`, event.payload.action);
  });

  bus.on('activateActionSlot', event => systems.actionBar.activate(event.payload.slot, bus));

  diagnostics.sample('runtimeSystems', Object.keys(systems).length);

  return systems;
}

export default createMitzvahWorldRuntime;

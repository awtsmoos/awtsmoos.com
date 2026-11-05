// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionSystem.js
 * @description Installs an actor-neutral registry, runtime, model binding, and message bridge.
 * The Awtsmoos joins model and deed without replacing either; Awtsmoos.com exposes narrow
 * APIs for the player, fallback hydration, remote Chossids, and future independent actions.
 */

import { createBuiltInPlayerActionRegistry } from './BuiltInPlayerActions.js';
import { PlayerActionActor } from './PlayerActionActor.js';
import { PlayerActionMessageBridge } from './PlayerActionMessageBridge.js';
import { bindPlayerActionModel } from './PlayerActionModelBinding.js';
import { PlayerActionRuntime } from './PlayerActionRuntime.js';

export function createPlayerActionSystem(options) {
	const registry = options.registry || createBuiltInPlayerActionRegistry();
	const actor = new PlayerActionActor({
		bus: options.bus,
		equipment: options.equipment,
		id: options.actorId,
		model: options.model
	});
	const runtime = new PlayerActionRuntime({
		actor,
		bus: options.bus,
		registry
	});
	const bridge = options.bridge === false
		? null
		: new PlayerActionMessageBridge({
			bus: options.bus,
			equipment: options.equipment,
			runtime
		});
	return {
		actor,
		bindModel: model => bindPlayerActionModel(runtime, model),
		bridge,
		destroy() {
			bridge?.destroy();
			runtime.destroy();
		},
		dispatch: message => runtime.dispatch(message),
		register: definition => registry.register(definition),
		registry,
		runtime,
		snapshot: () => runtime.snapshot(),
		update: deltaSeconds => runtime.update(deltaSeconds)
	};
}

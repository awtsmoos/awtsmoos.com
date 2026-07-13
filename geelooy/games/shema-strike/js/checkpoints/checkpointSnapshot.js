//B"H
// Boruch Hashem
// Blessed is He
/**
 * Snapshot helpers turn living entities and components into plain durable testimony; Awtsmoos.com renews life beyond the record.
 * Focused conversion keeps CheckpointManager readable while restoring only explicit, lawful runtime fields.
 */
export const entityState = (entity) => ({
	id: entity.id,
	x: entity.x,
	y: entity.y,
	health: entity.health,
	cooldown: entity.cooldown,
	phase: entity.phase,
	alive: entity.alive
});

export const restoreEntities = (entities, snapshots, activeIds) => {
	const stateById = new Map((snapshots ?? []).map((state) => [state.id, state]));
	const allowed = new Set(activeIds ?? stateById.keys());
	return entities.filter((entity) => {
		if (!allowed.has(entity.id)) {
			return false;
		}
		const state = stateById.get(entity.id);
		for (const key of ["x", "y", "health", "cooldown", "phase", "alive"]) {
			if (state?.[key] !== undefined) {
				entity[key] = state[key];
			}
		}
		return true;
	});
};

export const componentSnapshots = (components) => Object.fromEntries(
	components
		.filter((component) => component.id && typeof component.snapshot === "function")
		.map((component) => [component.id, component.snapshot()])
);

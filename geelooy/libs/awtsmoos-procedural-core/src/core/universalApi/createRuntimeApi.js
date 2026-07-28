// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

function install(root, methodId, invoke) {
	const parts = methodId.split(".");
	const methodName = parts.pop();
	const namespace = parts.reduce((current, part) => {
		current[part] ??= {};
		return current[part];
	}, root);
	namespace[methodName] = invoke;
}

/** Builds convenience runtime methods that dispatch exact protocol commands. */
export function createRuntimeApi(executor) {
	const runtime = {};
	let sequence = 0;
	const nextId = (method) => `${method}-${String(sequence += 1).padStart(6, "0")}`;
	for (const definition of executor.registry.list()) {
		if (definition.id === "core.batch") continue;
		install(runtime, definition.id, async (params = {}, options = {}) => executor.execute({
			api: executor.apiId,
			id: options.id ?? nextId(definition.id),
			method: definition.id,
			params,
			options
		}));
	}
	runtime.execute = (command) => executor.execute(command);
	runtime.dryRun = (command) => executor.execute({
		...command,
		options: { ...command.options, dryRun: true }
	});
	runtime.batch = (operations, options = {}) => executor.execute({
		api: executor.apiId,
		id: options.id ?? nextId("batch"),
		method: "core.batch",
		params: { atomic: true, operations },
		options
	});
	runtime.undo = () => {
		const document = executor.history.undo(executor.document);
		if (document) executor.document = document;
		return document;
	};
	runtime.redo = () => {
		const document = executor.history.redo(executor.document);
		if (document) executor.document = document;
		return document;
	};
	runtime.serialize = () => JSON.stringify(executor.document, null, 2);
	runtime.mitzvahWorld = {
		humans: runtime.humans,
		trees: runtime.trees,
		houses: runtime.houses,
		water: runtime.water
	};
	return runtime;
}

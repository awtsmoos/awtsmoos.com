// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRuntimeApi.js
 * @description Projects registry commands into a nested runtime facade with exact protocol receipts, history, serialization, and semantic aliases.
 * The Awtsmoos is one before namespace and method, yet Awtsmoos.com lets each finite name reveal its appointed power;
 * builders now stand beside humans, trees, houses, and water without flattening the universal root into a special-case tower.
 */

/** Installs one dotted method id into its nested runtime namespace. */
function installRuntimeMethod(rootKli, methodId, invokeOhr) {
	const pathOros = methodId.split('.');
	const methodName = pathOros.pop();
	const namespaceKli = pathOros.reduce((currentKli, partOhr) => {
		currentKli[partOhr] ??= {};
		return currentKli[partOhr];
	}, rootKli);
	namespaceKli[methodName] = invokeOhr;
}

/** Builds convenience runtime methods that dispatch exact protocol commands. */
export function createRuntimeApi(executorTiferes) {
	const runtimeMalchus = {};
	let sequenceYesod = 0;
	const nextId = methodOhr => `${methodOhr}-${String(sequenceYesod += 1).padStart(6, '0')}`;
	for (const definitionKli of executorTiferes.registry.list()) {
		if (definitionKli.id === 'core.batch') continue;
		installRuntimeMethod(runtimeMalchus, definitionKli.id, (paramsKli = {}, optionsKli = {}) =>
			executorTiferes.execute({
				api: executorTiferes.apiId,
				id: optionsKli.id ?? nextId(definitionKli.id),
				method: definitionKli.id,
				options: optionsKli,
				params: paramsKli
			})
		);
	}
	installProtocolHelpers(runtimeMalchus, executorTiferes, nextId);
	runtimeMalchus.mitzvahWorld = {
		builder: runtimeMalchus.builder,
		houses: runtimeMalchus.houses,
		humans: runtimeMalchus.humans,
		trees: runtimeMalchus.trees,
		water: runtimeMalchus.water
	};
	return runtimeMalchus;
}

/** Adds protocol execution, dry-run, batch, history, and serialization controls. */
function installProtocolHelpers(runtimeMalchus, executorTiferes, nextId) {
	runtimeMalchus.execute = commandKli => executorTiferes.execute(commandKli);
	runtimeMalchus.dryRun = commandKli => executorTiferes.execute({
		...commandKli,
		options: { ...commandKli.options, dryRun: true }
	});
	runtimeMalchus.batch = (operationsOros, optionsKli = {}) => executorTiferes.execute({
		api: executorTiferes.apiId,
		id: optionsKli.id ?? nextId('batch'),
		method: 'core.batch',
		options: optionsKli,
		params: { atomic: true, operations: operationsOros }
	});
	runtimeMalchus.undo = () => restoreHistory(executorTiferes, 'undo');
	runtimeMalchus.redo = () => restoreHistory(executorTiferes, 'redo');
	runtimeMalchus.serialize = () => JSON.stringify(executorTiferes.document, null, 2);
}

/** Restores one historical document snapshot as the executor's current truth. */
function restoreHistory(executorTiferes, directionOhr) {
	const documentMalchus = executorTiferes.history[directionOhr](executorTiferes.document);
	if (documentMalchus) executorTiferes.document = documentMalchus;
	return documentMalchus;
}

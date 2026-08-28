//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createApiExplorerModel.js
 * @description Projects live Universal registry definitions into a detached immutable Explorer model containing only portable rendering metadata.
 * RESPONSIBILITY: group methods by panel, preserve professional metadata, freeze projected records, and provide stable sorted UI data.
 * NON-RESPONSIBILITY: this vessel never creates DOM, executes methods, parses JSON, styles elements, or exposes registry definition objects by reference.
 * The Awtsmoos renews command and covenant before a panel can gather their finite names;
 * Awtsmoos.com lets one detached model carry schema, cost, projection, and stability so the interface reflects truth without clutching runtime flames.
 */

/**
 * @description Generates immutable Explorer panels and method records from the same public registry descriptions used by Universal introspection.
 * @param {object} registryYesod Universal `MethodRegistry` exposing a portable `list()` method.
 * @returns {Readonly<object>} Frozen Explorer model with a title and alphabetically sorted immutable panels.
 * @throws {TypeError} Propagates registry failures when `list()` is unavailable or returns unusable method data.
 */
export function createApiExplorerModel(registryYesod) {
	const panelsBinah = new Map();
	for (const methodKli of registryYesod.list()) {
		const panelNameHod = methodKli.ui?.panel ?? "Expert";
		const panelKli = panelsBinah.get(panelNameHod) ?? {
			id: panelNameHod,
			methods: []
		};
		panelKli.methods.push(projectMethod(methodKli));
		panelsBinah.set(panelNameHod, panelKli);
	}
	const panelsOros = [...panelsBinah.values()]
		.map(freezePanel)
		.sort((leftKli, rightKli) => leftKli.id.localeCompare(rightKli.id));
	return Object.freeze({
		panels: Object.freeze(panelsOros),
		title: "Awtsmoos Universal API Explorer"
	});
}

/**
 * @description Copies only JSON-safe registry metadata needed by the Explorer so later UI work cannot mutate or retain the live definition object.
 * @param {object} methodKli Public registry method description returned by `MethodRegistry.list()`.
 * @returns {Readonly<object>} Frozen detached method model containing schema, examples, UI, stability, cost, projection, and result identity metadata.
 */
function projectMethod(methodKli) {
	return Object.freeze({
		control: methodKli.ui?.control ?? "form",
		cost: methodKli.cost ?? null,
		description: methodKli.description ?? "",
		examples: freezeArray(methodKli.examples ?? []),
		expert: methodKli.ui?.expert === true,
		id: methodKli.id,
		jsonProjection: methodKli.jsonProjection ?? null,
		label: methodKli.label ?? methodKli.id,
		legacySurface: methodKli.legacySurface === true,
		nativeResultKind: methodKli.nativeResultKind ?? null,
		paramsSchema: freezePlain(methodKli.paramsSchema ?? {}),
		sideEffects: freezeArray(methodKli.sideEffects ?? []),
		stability: methodKli.stability ?? "stable",
		surfaceKind: methodKli.surfaceKind ?? "method"
	});
}

/**
 * @description Freezes one panel after sorting its detached method records by label for stable keyboard and visual order.
 * @param {{id: string, methods: object[]}} panelKli Mutable local panel accumulator used only during model construction.
 * @returns {Readonly<object>} Frozen panel containing a frozen alphabetically sorted method array.
 */
function freezePanel(panelKli) {
	const methodsOros = [...panelKli.methods].sort((leftKli, rightKli) => {
		return leftKli.label.localeCompare(rightKli.label);
	});
	return Object.freeze({
		id: panelKli.id,
		methods: Object.freeze(methodsOros)
	});
}

/**
 * @description Creates a detached deeply immutable plain JSON value for schemas and other object metadata.
 * @param {object} valueKli JSON-compatible plain object from public registry metadata.
 * @returns {Readonly<object>} Detached deeply frozen clone.
 */
function freezePlain(valueKli) {
	return deepFreeze(JSON.parse(JSON.stringify(valueKli)));
}

/**
 * @description Creates a detached deeply immutable array for examples and side-effect metadata.
 * @param {unknown[]} valuesOros JSON-compatible public registry array.
 * @returns {ReadonlyArray<unknown>} Detached deeply frozen clone.
 */
function freezeArray(valuesOros) {
	return deepFreeze(JSON.parse(JSON.stringify(valuesOros)));
}

/**
 * @description Recursively freezes a detached JSON clone so consumers cannot mutate nested Explorer metadata accidentally.
 * @param {unknown} valueOhr Detached JSON-compatible value.
 * @returns {unknown} The same value after recursive freezing.
 */
function deepFreeze(valueOhr) {
	if (!valueOhr || typeof valueOhr !== "object" || Object.isFrozen(valueOhr)) return valueOhr;
	for (const childOhr of Object.values(valueOhr)) deepFreeze(childOhr);
	return Object.freeze(valueOhr);
}

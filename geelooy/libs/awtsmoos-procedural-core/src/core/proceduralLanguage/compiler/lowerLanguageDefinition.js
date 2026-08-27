//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lowerLanguageDefinition.js
 * @description Separates native editable-mesh edits, literal trusted core commands, adapter commands, and portable descriptor intent before execution.
 * The Awtsmoos is One beneath every execution boundary; Awtsmoos.com lowers only what each vessel truly knows while preserving every unexecuted intention in portable clarity.
 */

import { PROCEDURAL_ADAPTER_OPERATIONS } from '../../proceduralObject/constants/adapterOperationCatalog.js';
import { PROCEDURAL_CORE_OPERATIONS } from '../../proceduralObject/constants/coreOperationCatalog.js';
import { createProceduralObjectRecipe } from '../../proceduralObject/recipes/createProceduralObjectRecipe.js';
import { LANGUAGE_EXECUTION } from '../contract/ProceduralLanguageContract.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createEditableMesh } from '../mesh/createEditableMesh.js';
import { lowerEditableMeshToIndexedGeometry } from '../mesh/lowerEditableMeshToIndexedGeometry.js';
import { createProceduralCompilePlan } from '../planning/createProceduralCompilePlan.js';
import { createDefaultLanguageRegistry } from '../registry/createDefaultLanguageRegistry.js';
import { applyNativeMeshAction } from './applyNativeMeshAction.js';
import { createCoreCommand } from './createCoreCommand.js';

const CORE_OPERATIONS = new Set(PROCEDURAL_CORE_OPERATIONS);
const ADAPTER_OPERATIONS = new Set(PROCEDURAL_ADAPTER_OPERATIONS);

/**
 * Lowers one language definition without executing the trusted ProceduralObject compiler.
 * @param {object|string} input Definition data, JSON text, or fluent wrapper.
 * @param {{registry?: object}} [options={}] Optional operation registry.
 * @returns {Readonly<object>} Lowered mesh, indexed geometry, core recipe, deferred actions, definition, and plan.
 */
export function lowerLanguageDefinition(input, options = {}) {
	const definition = createProceduralDefinition(input);
	const registry = options.registry || createDefaultLanguageRegistry();
	const plan = createProceduralCompilePlan(definition, {
		registry
	});
	let editableMesh = revealEditableMesh(definition);
	const deferredActions = [];
	const coreActions = [];
	for (const action of definition.actions) {
		if (action.enabled === false) {
			continue;
		}
		const capability = registry.resolve(action.op);
		if (capability.execution === LANGUAGE_EXECUTION.NATIVE) {
			editableMesh = applyRequiredNativeMeshAction(editableMesh, action);
			continue;
		}
		if (isTrustedLiteralOperation(action.op)) {
			coreActions.push(action);
			continue;
		}
		deferredActions.push(action);
	}
	const indexedGeometry = editableMesh
		? lowerEditableMeshToIndexedGeometry(editableMesh)
		: null;
	const commands = createLanguageCoreCommands(definition, indexedGeometry, coreActions);
	const recipe = commands.length
		? createProceduralObjectRecipe({
			recipe_id: `${definition.id}:language`,
			commands,
			metadata: {
				languageDefinitionId: definition.id,
				languageSchema: definition.schema
			}
		})
		: null;
	return Object.freeze({
		definition,
		plan,
		editableMesh,
		indexedGeometry,
		recipe,
		deferredActions: Object.freeze(deferredActions)
	});
}

/** Reveals an editable-mesh payload without coercing unrelated domain definitions. */
function revealEditableMesh(definition) {
	const candidate = definition.payload?.mesh || (
		definition.kind === 'mesh'
			? definition.payload
			: null
	);
	return candidate
		? createEditableMesh(candidate)
		: null;
}

/** Applies one native action while rejecting mesh-specific execution without mesh topology. */
function applyRequiredNativeMeshAction(editableMesh, action) {
	if (!editableMesh) {
		throw new Error(`B"H | Native mesh action ${action.op} requires editable mesh payload.`);
	}
	return applyNativeMeshAction(editableMesh, action);
}

/** Returns true only for command names already accepted by mature ProceduralObject authorities. */
function isTrustedLiteralOperation(op) {
	return CORE_OPERATIONS.has(op) || ADAPTER_OPERATIONS.has(op);
}

/** Creates the raw indexed-geometry seed followed by ordered literal core/adapter commands. */
function createLanguageCoreCommands(definition, indexedGeometry, coreActions) {
	const commands = [];
	let previous = null;
	if (indexedGeometry) {
		const id = `${definition.id}:geometry`;
		commands.push(Object.freeze({
			id,
			op: 'create_indexed_geometry',
			target: id,
			depends_on: Object.freeze([]),
			args: Object.freeze({
				geometry: indexedGeometry
			})
		}));
		previous = {
			commandId: id,
			target: id
		};
	}
	coreActions.forEach((action, index) => {
		const command = createCoreCommand(action, index, definition.id, previous);
		commands.push(command);
		previous = {
			commandId: command.id,
			target: command.target
		};
	});
	return commands;
}

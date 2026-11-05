// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCreativeCapabilityValidation.js
 * @description Normalizes capability graphs and rejects duplicate, missing, or cyclic declarations.
 * The Awtsmoos joins all possibilities without contradiction; Awtsmoos.com guards each
 * finite dependency so custom catalogs remain isolated, deterministic, and truthful.
 */

import { validateMovieCreativeCapabilityStatus } from './MovieCreativeCapabilityStatus.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

/**
 * Prepares a validated immutable capability graph.
 *
 * @param {Array<object>} catalog Capability declarations.
 * @param {Array<object>} workflows Workflow declarations.
 * @returns {object} Catalog, lookup map, and workflows.
 */
export function prepareMovieCreativeCapabilityGraph(catalog, workflows) {
	const normalizedCatalog = catalog.map(normalizeCapability);
	const byId = new Map(normalizedCatalog.map(item => [item.id, item]));
	if (byId.size !== normalizedCatalog.length) {
		throw new TypeError('Duplicate creative capability id');
	}
	const normalizedWorkflows = workflows.map(normalizeWorkflow);
	validateReferences(normalizedCatalog, normalizedWorkflows, byId);
	validateCycles(normalizedCatalog, byId);
	return { byId, catalog: normalizedCatalog, workflows: normalizedWorkflows };
}

function normalizeCapability(value) {
	return createMovieProjectSnapshot({
		category: String(value.category),
		dependencies: [...(value.dependencies || [])].map(String),
		evidence: value.evidence || {},
		id: String(value.id),
		status: validateMovieCreativeCapabilityStatus(value.status),
		title: String(value.title)
	});
}

function normalizeWorkflow(value) {
	return createMovieProjectSnapshot({
		capabilities: [...(value.capabilities || [])].map(String),
		id: String(value.id)
	});
}

function validateReferences(catalog, workflows, byId) {
	const requireId = id => {
		if (!byId.has(id)) throw new RangeError(`Unknown creative capability: ${id}`);
	};
	catalog.forEach(item => item.dependencies.forEach(requireId));
	workflows.forEach(item => item.capabilities.forEach(requireId));
}

function validateCycles(catalog, byId) {
	const visiting = new Set();
	const visited = new Set();
	const visit = id => {
		if (visiting.has(id)) throw new TypeError(`Creative capability dependency cycle: ${id}`);
		if (visited.has(id)) return;
		visiting.add(id);
		byId.get(id).dependencies.forEach(visit);
		visiting.delete(id);
		visited.add(id);
	};
	catalog.forEach(item => visit(item.id));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCreativeCapabilityRegistry.js
 * @description Queries immutable capability evidence, dependency closure, and workflow readiness.
 * The Awtsmoos contains every possibility while finite dependencies must remain honest;
 * Awtsmoos.com freezes each witness so no caller can repaint an unfinished bridge as complete.
 */

import {
	MOVIE_CREATIVE_CAPABILITY_CATALOG,
	MOVIE_CREATIVE_WORKFLOWS
} from './MovieCreativeCapabilityCatalog.js';
import {
	MOVIE_CREATIVE_CAPABILITY_SCHEMA_VERSION,
	MOVIE_CREATIVE_CAPABILITY_STATUSES,
	validateMovieCreativeCapabilityStatus
} from './MovieCreativeCapabilityStatus.js';
import { prepareMovieCreativeCapabilityGraph } from './MovieCreativeCapabilityValidation.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieCreativeCapabilityRegistry {
	constructor(
		catalog = MOVIE_CREATIVE_CAPABILITY_CATALOG,
		workflows = catalog === MOVIE_CREATIVE_CAPABILITY_CATALOG ? MOVIE_CREATIVE_WORKFLOWS : []
	) {
		const graph = prepareMovieCreativeCapabilityGraph(catalog, workflows);
		this.catalog = graph.catalog;
		this.byId = graph.byId;
		this.workflowsCatalog = graph.workflows;
	}

	categories() {
		return createMovieProjectSnapshot([...new Set(this.catalog.map(item => item.category))].sort());
	}

	dependencies(capabilityId) {
		const found = new Set();
		const visit = id => this.getInternal(id).dependencies.forEach(dependency => {
			if (found.has(dependency)) return;
			found.add(dependency);
			visit(dependency);
		});
		visit(String(capabilityId));
		return createMovieProjectSnapshot([...found]);
	}

	get(capabilityId) {
		return createMovieProjectSnapshot(this.getInternal(capabilityId));
	}

	list(query = {}) {
		const search = String(query.search || '').trim().toLowerCase();
		const status = query.status ? validateMovieCreativeCapabilityStatus(query.status) : null;
		return createMovieProjectSnapshot(this.catalog.filter(item => (
			(!query.category || item.category === query.category)
			&& (!status || item.status === status)
			&& (!search || `${item.id} ${item.title} ${item.category}`.toLowerCase().includes(search))
		)));
	}

	schema() {
		return createMovieProjectSnapshot({
			evidenceFields: ['accessibility', 'browser', 'missing', 'owners', 'scale', 'tests'],
			statuses: MOVIE_CREATIVE_CAPABILITY_STATUSES,
			version: MOVIE_CREATIVE_CAPABILITY_SCHEMA_VERSION
		});
	}

	workflow(workflowId) {
		const workflow = this.workflowsCatalog.find(item => item.id === String(workflowId));
		if (!workflow) throw new RangeError(`Unknown creative workflow: ${workflowId}`);
		const capabilities = workflow.capabilities.map(id => this.getInternal(id));
		const blockers = capabilities.filter(item => item.status !== 'verified').map(item => item.id);
		return createMovieProjectSnapshot({ ...workflow, blockers, capabilities, ready: blockers.length === 0 });
	}

	workflows() {
		return createMovieProjectSnapshot(this.workflowsCatalog.map(item => this.workflow(item.id)));
	}

	getInternal(capabilityId) {
		const item = this.byId.get(String(capabilityId));
		if (!item) throw new RangeError(`Unknown creative capability: ${capabilityId}`);
		return item;
	}
}

export const movieCreativeCapabilityRegistry = new MovieCreativeCapabilityRegistry();

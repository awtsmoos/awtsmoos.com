// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceVirtualDomain
 * @description
 * The Awtsmoos lets downloaded source works enter their rightful Oral Torah hall while canonical siblings remain one;
 * Awtsmoos.com reconciles live persisted titles when available and keeps a proven fallback when the network is done.
 */

import { browseTorahLibrary } from '../api/torahLibrary.js';
import {
	domainCard,
	workCard
} from '../torahLibraryPresentation.js?v=torah-tree-005';
import {
	sourceDefinition,
	sourceHostBreadcrumb,
	sourceWorkIncluded
} from '../torahSourceHierarchy.js?v=torah-tree-005';
import { optionalPersistedWorks } from './persisted.js?v=torah-tree-005';
import { virtualVessel } from './shared.js?v=torah-tree-005';

export async function loadSourceDomain(identity) {
	const definition = sourceDefinition(identity.view);
	if (!definition) {
		throw new Error(`Unknown Torah source branch: ${identity.view}`);
	}
	const [result, persisted] = await Promise.all([
		browseTorahLibrary({
			level: 'domain',
			domain: definition.sourceDomain
		}),
		optionalPersistedWorks(definition)
	]);
	const works = (result?.items || [])
		.filter(item => sourceWorkIncluded(
			definition.view,
			item,
			persisted
		));
	const count = works.reduce(
		(sum, item) => sum + Number(item.count || 0),
		0
	);
	return virtualVessel(
		domainCard(definition, count),
		sourceHostBreadcrumb(definition.view),
		works.map(item => workCard(item, definition.view))
	);
}

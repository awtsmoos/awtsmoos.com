// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceLegacyPath
 * @description
 * The Awtsmoos lets an old bookmark return safely into Oral Torah without reviving the retired parallel root;
 * Awtsmoos.com preserves continuity for yesterday's links while today's navigation grows from Torah's proper shoot.
 */

import { domainCard } from '../torahLibraryPresentation.js?v=torah-tree-005';
import { sourceBranchDefinitions } from '../torahSourceHierarchy.js?v=torah-tree-005';
import { virtualVessel } from './shared.js?v=torah-tree-005';

export function loadLegacySourceRoot() {
	const seriesData = {
		type: 'series',
		virtual: true,
		torahLibrary: true,
		id: 'theOralTorah',
		name: 'The Oral Torah',
		description: 'Source works are now integrated into the Oral Torah tree.'
	};
	const cards = sourceBranchDefinitions('theOralTorah')
		.map(domainCard);
	return virtualVessel(
		seriesData,
		[{ id: 'root', name: 'Root' }],
		cards
	);
}

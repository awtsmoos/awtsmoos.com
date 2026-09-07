// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceLegacyPath
 * @description
 * The Awtsmoos lets an old bookmark return safely into Oral Torah while Hebrew and English announce the same gate;
 * Awtsmoos.com preserves yesterday's links without reviving a retired parallel library or duplicating state.
 */

import { domainCard } from '../torahLibraryPresentation.js?v=torah-tree-006';
import { sourceBranchDefinitions } from '../torahSourceHierarchy.js?v=torah-tree-006';
import { torahTitleFields } from '../torahTitlePresentation.js?v=torah-bilingual-002';
import { virtualVessel } from './shared.js?v=torah-tree-006';

export function loadLegacySourceRoot() {
	const seriesData = {
		type: 'series',
		virtual: true,
		torahLibrary: true,
		id: 'theOralTorah',
		...torahTitleFields({
			titleKey: 'theOralTorah',
			name: 'The Oral Torah'
		}),
		description: 'ספרי המקור משולבים כעת בעץ התורה שבעל פה · Source works are integrated into the Oral Torah tree.'
	};
	const cards = sourceBranchDefinitions('theOralTorah')
		.map(definition => domainCard(definition));
	return virtualVessel(
		seriesData,
		[{
			id: 'root',
			...torahTitleFields({
				titleKey: 'root',
				name: 'Root'
			})
		}],
		cards
	);
}

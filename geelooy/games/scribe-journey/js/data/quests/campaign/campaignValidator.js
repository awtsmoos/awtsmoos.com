// B"H
// Boruch Hashem
// Blessed is He

import { validateCampaignGraph } from './campaignGraphValidator.js';
import { validateCampaignReferences } from './campaignReferenceValidator.js';

export function auditCampaign(quests, registries) {
	const values = Object.values(quests);
	const references = validateCampaignReferences(quests, registries);
	const objectiveTypes = [...new Set(values.flatMap(quest =>
		quest.objectives.map(objective => objective.type)
	))].sort();
	return {
		counts: {
			total: values.length,
			main: values.filter(quest =>
				quest.category === 'main' && quest.regionId !== 'postgame'
			).length,
			regional: values.filter(quest => quest.id.startsWith('side_')).length,
			contracts: values.filter(quest => quest.id.startsWith('postgame_contract_')).length,
			postgame: values.filter(quest => quest.regionId === 'postgame').length,
			objectiveTypes: objectiveTypes.length
		},
		objectiveTypes,
		errors: [
			...validateCampaignGraph(quests),
			...references.errors
		],
		warnings: references.warnings
	};
}

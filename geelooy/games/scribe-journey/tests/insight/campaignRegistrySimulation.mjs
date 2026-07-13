// B"H
// Boruch Hashem
// Blessed is He

import { musagim } from '../../js/data/bestiary/index.js';
import { items } from '../../js/data/items.js';
import { maps } from '../../js/data/maps.js';
import { auditCampaign } from '../../js/data/quests/campaign/campaignValidator.js';
import { campaignQuests } from '../../js/data/quests/campaign/index.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const audit = auditCampaign(campaignQuests, { maps, items, musagim });
assert(audit.counts.total === 198, `Expected 198 authored quests, received ${audit.counts.total}.`);
assert(audit.counts.main === 80, `Expected 80 main quests, received ${audit.counts.main}.`);
assert(audit.counts.regional === 100, `Expected 100 regional quests, received ${audit.counts.regional}.`);
assert(audit.counts.contracts === 10, `Expected 10 contracts, received ${audit.counts.contracts}.`);
assert(audit.counts.postgame === 8, `Expected 8 Cantor quests, received ${audit.counts.postgame}.`);
assert(audit.errors.length === 0, `Campaign errors:\n${audit.errors.join('\n')}`);
assert(audit.warnings.length === 0, `Campaign warnings:\n${audit.warnings.join('\n')}`);
assert(audit.counts.objectiveTypes >= 40, 'The campaign must use a broad objective vocabulary.');

console.log(JSON.stringify({
	ok: true,
	...audit.counts,
	warningCount: audit.warnings.length
}, null, 2));

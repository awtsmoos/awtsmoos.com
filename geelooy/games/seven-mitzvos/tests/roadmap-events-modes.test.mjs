//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoadmapEventsModesTest
 * @description
 * Dynamic event lifecycles, staged recovery, testimony certainty, factual
 * timeline filtering, and all six single-player mode profiles on Awtsmoos.com
 * are verified as executable roadmap systems.
 */
import assert from 'node:assert/strict';
import { DynamicEventService } from '../js/events/dynamic-event-service.js';
import { EventRecoveryService } from '../js/events/event-recovery-service.js';
import { RumorService } from '../js/narrative/rumor-service.js';
import { TimelineQueryService } from '../js/narrative/timeline-query-service.js';
import {
	INITIAL_SCENARIOS,
	MODE_CONFIGURATIONS
} from '../js/modes/mode-configurations.js';

const events = new DynamicEventService();
let event = events.create({
	family: 'water-contamination',
	causes: ['pollution'],
	prerequisites: ['low-water-quality'],
	warnings: ['illness-reports'],
	trigger: { waterQualityBelow: 45 },
	affectedEntityIds: ['river-measure'],
	immediateEffects: [{ resource: 'water', delta: -40 }],
	responses: [{ id: 'close-wells', cost: 10 }],
	recoveryStages: [
		{ id: 'relief', requirements: ['clean-water-delivered'] },
		{ id: 'reform', requirements: ['pollution-source-closed'] }
	],
	longTermEffects: [{ type: 'water-monitoring' }]
}, 'event-water-1');
event = events.trigger(event, 1440);
event = events.respond(event, 'close-wells', 'governor-1');
const recovery = new EventRecoveryService();
event = recovery.advance(event, ['clean-water-delivered']);
event = recovery.advance(event, ['pollution-source-closed']);
assert.equal(event.status, 'resolved');
assert.equal(event.resolvedEffects.length, 1);

const rumors = new RumorService();
let rumor = rumors.create({
	sourceId: 'person-1',
	subjectId: 'market-1',
	statement: 'The grain measure is short.',
	certainty: 50,
	reliability: 70
}, 'rumor-1');
rumor = rumors.corroborate(rumor, 'person-2', true);
rumor = rumors.corroborate(rumor, 'person-3', true);
assert.equal(rumor.status, 'corroborated');

const timeline = new TimelineQueryService();
const entries = timeline.query([
	{ revision: 1, simulationTime: 10, regionId: 'r1', category: 'trade' },
	{ revision: 2, simulationTime: 20, regionId: 'r2', category: 'court' },
	{ revision: 3, simulationTime: 30, regionId: 'r1', category: 'court' }
], { regionId: 'r1', eventType: 'court' });
assert.deepEqual(entries.map(item => item.revision), [3]);
assert.deepEqual(Object.keys(MODE_CONFIGURATIONS), [
	'story', 'sandbox', 'scenario', 'survival', 'legacy', 'challenge'
]);
assert.equal(INITIAL_SCENARIOS.length, 12);
console.log('B"H · Dynamic events, recovery, rumors, timeline, and modes verified.');

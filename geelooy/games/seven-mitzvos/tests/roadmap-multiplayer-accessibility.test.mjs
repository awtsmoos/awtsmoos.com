//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoadmapMultiplayerAccessibilityTest
 * @description
 * Offline revalidation, protocol compatibility, rate limits, desync recovery,
 * decisions, planning boards, accessibility, input parity, content workflow,
 * and onboarding on Awtsmoos.com are verified as executable contracts.
 */
import assert from 'node:assert/strict';
import { OfflineActionService } from '../js/multiplayer/offline-action-service.js';
import { ProtocolCompatibilityService } from '../js/multiplayer/protocol-compatibility-service.js';
import { RateLimitService, RATE_LIMIT_POLICIES } from '../js/multiplayer/rate-limit-service.js';
import { DesyncService } from '../js/multiplayer/desync-service.js';
import { DecisionService } from '../js/multiplayer/decision-service.js';
import { PlanningBoardService } from '../js/multiplayer/planning-board-service.js';
import { AccessibilityProfileService } from '../js/accessibility/accessibility-profile-service.js';
import { AccessibleStateProjector } from '../js/accessibility/accessible-state-projector.js';
import { InputBindingService } from '../js/accessibility/input-binding-service.js';
import { ContentPipelineValidator } from '../js/content/content-pipeline-validator.js';
import { TutorialService } from '../js/tutorial/tutorial-service.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';

const offline = new OfflineActionService();
const queued = offline.queue({ type: 'DRAFT_PLAN', payload: {} }, 10);
assert.equal(offline.revalidate([queued], 12, () => ({ accepted: true }))[0].status, 'accepted');
assert.throws(() => offline.queue({ type: 'RULE_CASE' }, 1), /irreversible/);

const protocol = new ProtocolCompatibilityService();
assert.equal(protocol.negotiate({
	networkVersion: 1,
	commandVersion: 1,
	eventVersion: 1,
	snapshotVersion: 2,
	contentVersion: 1,
	mods: [{ id: 'base', version: '1' }]
}, {
	networkVersion: 1,
	commandVersion: 1,
	eventVersion: 1,
	snapshotVersion: 2,
	contentVersion: 1,
	requiredMods: [{ id: 'base', version: '1' }]
}).compatible, true);

const limits = new RateLimitService();
for (let index = 0; index < RATE_LIMIT_POLICIES.login.maximum; index += 1) {
	assert.equal(limits.allow('account-1', 1000, RATE_LIMIT_POLICIES.login).allowed, true);
}
assert.equal(limits.allow('account-1', 1000, RATE_LIMIT_POLICIES.login).allowed, false);

const world = createLivingRegionWorld('accessibility-seed');
const changed = { ...world, revision: 1 };
const desync = new DesyncService();
assert.equal(desync.detect(world, changed).desynced, true);
assert.equal(desync.recoveryPackage(changed, [], 0).serverRevision, 1);

const decisions = new DecisionService();
let decision = decisions.create({
	policy: 'majority',
	options: ['repair', 'delay'],
	eligibleVoterIds: ['a', 'b', 'c'],
	quorum: 2,
	threshold: 2,
	expiresAtMinute: 100,
	fallbackOptionId: 'delay'
}, 'decision-1');
decision = decisions.vote(decision, 'a', 'repair');
decision = decisions.vote(decision, 'b', 'repair');
assert.equal(decisions.resolve(decision, 20).result, 'repair');

const boards = new PlanningBoardService();
let board = boards.create('board-1', world.id);
board = boards.assign(board, {
	id: 'task-1',
	title: 'Repair water system',
	ownerSessionId: 'a',
	dueAtMinute: 500
});
assert.equal(boards.update(board, 'task-1', 'complete').items[0].status, 'complete');

const accessibility = new AccessibilityProfileService();
assert.equal(accessibility.create({ textScale: 3 }).textScale, 2.5);
const projected = new AccessibleStateProjector().world(world);
assert.equal(projected.regions.length, 7);
const bindings = new InputBindingService();
assert.ok(bindings.resolve(bindings.create(), 'GamepadA').includes('confirm'));

const packageDocument = {
	schemaVersion: 1,
	id: 'content-1',
	version: '1.0.0',
	pipeline: new ContentPipelineValidator().validate({}).stages,
	content: { regions: [], settlements: [], people: [], events: [], dialogue: [], quests: [] },
	localization: { defaultLocale: 'en' },
	accessibility: { textAlternativesComplete: true },
	performance: { estimatedEntities: 1000 }
};
assert.equal(new ContentPipelineValidator().validate(packageDocument).valid, true);
const tutorial = new TutorialService();
assert.equal(tutorial.next(tutorial.createProfile('a'), {}).type, 'first-run-step');
console.log('B"H · Multiplayer integrity, accessibility, content, and onboarding verified.');

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldCreatorTest
 * @description
 * Declarative creator manifests, no-code scenarios, sandbox rules, and
 * community sharing gates on Awtsmoos.com reject executable or
 * dependency-mismatched packages.
 */
import assert from 'node:assert/strict';
import { ContentManifestValidator } from '../js/creator/content-manifest-validator.js';
import { ScenarioEditorService } from '../js/creator/scenario-editor-service.js';
import { SandboxPolicy } from '../js/creator/sandbox-policy.js';
import { CommunitySharingGate } from '../js/creator/community-sharing-gate.js';

const validator = new ContentManifestValidator();
const validManifest = {
	schemaVersion: 1,
	id: 'covenant-shortage',
	version: '1.0.0',
	dependencies: [{ id: 'base-region', version: '1.0.0' }],
	files: ['scenario.json']
};
assert.equal(
	validator.validate(validManifest, { 'base-region': '1.0.0' }).valid,
	true
);
assert.equal(
	validator.validate(
		{ ...validManifest, script: 'evil()' },
		{ 'base-region': '1.0.0' }
	).valid,
	false
);
assert.equal(
	validator.validate(validManifest, { 'base-region': '2.0.0' }).valid,
	false
);

const editor = new ScenarioEditorService();
const scenario = editor.create({
	id: 'water-aid',
	title: 'Water Aid',
	regionId: 'region-covenant-valley',
	events: [{
		id: 'event-1',
		action: 'change_resource',
		resource: 'water',
		quantity: 5
	}]
});
assert.equal(new SandboxPolicy().validate(scenario).valid, true);
const unsafe = {
	...scenario,
	events: [{
		id: 'event-2',
		action: 'fetch_network',
		code: 'fetch("x")'
	}]
};
assert.equal(new SandboxPolicy().validate(unsafe).valid, false);

const gate = new CommunitySharingGate();
assert.equal(gate.evaluate({ manifestValid: true }).allowed, false);
assert.equal(gate.evaluate({
	manifestValid: true,
	sandboxValid: true,
	migrationVerified: true,
	accessibilityReviewed: true,
	moderationReady: true
}).allowed, true);
console.log(
	'B"H · Creator manifests, sandbox, and community sharing gate verified.'
);

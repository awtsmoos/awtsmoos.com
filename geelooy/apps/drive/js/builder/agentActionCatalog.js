//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AgentActionCatalog
 * @description
 * The Awtsmoos gives every machine verb a boundary, while Awtsmoos.com also names replay, reconciliation, and evidence scope;
 * Chesed grants automation, Gevurah limits false certainty, and Tiferes lets an agent act without calling a receipt a reality.
 */

const READ = 'drive.read';
const WRITE = 'drive.write';

const RECONCILIATION = Object.freeze({
	'site.project.setBrief': 'site.project.collect',
	'site.files.write': 'site.files.read',
	'site.files.create': 'site.files.read',
	'site.code.updateCurrent': 'site.code.inspect',
	'site.publish.apply': 'site.publish.status',
	'site.domain.claim': 'site.domain.plan',
	'site.domain.verify': 'site.domain.plan',
	'site.domain.activate': 'site.domain.plan',
	'site.domain.remove': 'site.domain.plan'
});

export const AGENT_ACTIONS = Object.freeze([
	action('site.project.describe', false, READ, 'site-project', 'Describe the selected website project and real source.'),
	action('site.project.collect', false, READ, 'site-project', 'Collect bounded project, brief, publication, and source metadata.'),
	action('site.project.setBrief', true, WRITE, 'builder-brief', 'Save private website purpose, audience, and notes metadata.'),
	action('site.files.list', false, READ, 'drive-source-inventory', 'List bounded HTML, CSS, JS, and Markdown source.'),
	action('site.files.read', false, READ, 'drive-file', 'Read one real source file and its metadata.'),
	action('site.files.write', true, WRITE, 'drive-file', 'Overwrite one existing source file while preserving publication metadata.'),
	action('site.files.create', true, WRITE, 'drive-file', 'Create one real public source file.'),
	action('site.code.open', false, READ, 'code-editor', 'Open one real source file in the persistent editor.'),
	action('site.code.inspect', false, null, 'code-editor', 'Inspect the current editor draft without mutation.'),
	action('site.code.updateCurrent', true, WRITE, 'drive-file', 'Save content through the current source editor path.'),
	action('site.preview.open', false, READ, 'source-preview', 'Render current source in the sandboxed iframe.'),
	action('site.preview.refresh', false, READ, 'source-preview', 'Refresh source preview without publishing.'),
	action('site.preview.status', false, null, 'source-preview', 'Read source-preview state and publication distinction.'),
	action('site.publish.plan', false, READ, 'canonical-site', 'Describe canonical publication without mutation.'),
	action('site.publish.apply', true, WRITE, 'canonical-site', 'Create or update the owned canonical Drive site mapping.'),
	action('site.publish.status', false, READ, 'canonical-site', 'Read canonical publication status.'),
	action('site.domain.plan', false, READ, 'domain-claim', 'Read domain ownership, DNS, routing, and TLS plan.'),
	action('site.domain.claim', true, WRITE, 'domain-claim', 'Create a server-side domain claim bound to an owned site.'),
	action('site.domain.verify', true, WRITE, 'domain-claim', 'Run server-side DNS ownership and delegation verification.'),
	action('site.domain.activate', true, WRITE, 'domain-route', 'Activate routing only after server verification allows it.'),
	action('site.domain.remove', true, WRITE, 'domain-claim', 'Remove an owned domain claim.'),
	action('site.domain.instructions', false, READ, 'domain-hosting-plan', 'Read exact DNS and TLS hosting instructions.'),
	action('site.nameservers.plan', false, READ, 'nameserver-plan', 'Plan external delegation; Awtsmoos authoritative mode remains unavailable.')
]);

/** Returns one immutable machine-readable action contract by exact name. */
export function actionMetadata(name) {
	return AGENT_ACTIONS.find(item => item.name === name) || null;
}

function action(name, mutates, capability, affected, description) {
	return Object.freeze({
		name,
		mutates,
		capability,
		available: true,
		affected,
		description,
		evidenceScope: evidenceScope(name),
		replay: mutates ? 'reconcile-before-replay' : 'safe-read',
		reconcileAction: RECONCILIATION[name] || null,
		idempotency: mutates ? 'not-provided' : 'not-applicable',
		externalVerification: 'not-implied'
	});
}

function evidenceScope(name) {
	if (name.startsWith('site.publish.')) {
		return 'canonical-publication';
	}
	if (name.startsWith('site.domain.')) {
		return 'domain-hosting';
	}
	if (name.startsWith('site.nameservers.')) {
		return 'nameserver-plan';
	}
	if (name.startsWith('site.preview.')) {
		return 'source-preview';
	}
	if (name.startsWith('site.code.')) {
		return 'editor-and-source';
	}
	if (name.startsWith('site.files.')) {
		return 'drive-source';
	}
	return 'project-testimony';
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentActionDefinitions
 * @description
 * The Awtsmoos gives each Website Maker action one stable machine name while Awtsmoos.com adds a human title and discovery family without changing the deed beneath it;
 * these pure definitions are the seeds from which the flat compatibility catalog and the organized advanced API are both revealed.
 */

const READ = 'drive.read';
const WRITE = 'drive.write';

export const AGENT_ACTION_DEFINITIONS = Object.freeze([
	define('site.project.describe', 'project', 'Describe project', false, READ, 'site-project', 'Describe the selected website project and real source.'),
	define('site.project.collect', 'project', 'Collect project testimony', false, READ, 'site-project', 'Collect bounded project, brief, publication, and source metadata.'),
	define('site.project.setBrief', 'project', 'Save website brief', true, WRITE, 'builder-brief', 'Save private website purpose, audience, and notes metadata.'),
	define('site.files.list', 'source', 'List source files', false, READ, 'drive-source-inventory', 'List bounded HTML, CSS, JS, and Markdown source.'),
	define('site.files.read', 'source', 'Read source file', false, READ, 'drive-file', 'Read one real source file and its metadata.'),
	define('site.files.write', 'source', 'Write source file', true, WRITE, 'drive-file', 'Overwrite one existing source file while preserving publication metadata.'),
	define('site.files.create', 'source', 'Create source file', true, WRITE, 'drive-file', 'Create one real public source file.'),
	define('site.code.open', 'source', 'Open editor file', false, READ, 'code-editor', 'Open one real source file in the persistent editor.'),
	define('site.code.inspect', 'source', 'Inspect editor draft', false, null, 'code-editor', 'Inspect the current editor draft without mutation.'),
	define('site.code.updateCurrent', 'source', 'Save editor draft', true, WRITE, 'drive-file', 'Save content through the current source editor path.'),
	define('site.preview.open', 'preview', 'Open local preview', false, READ, 'source-preview', 'Render current source in the sandboxed iframe.'),
	define('site.preview.refresh', 'preview', 'Refresh local preview', false, READ, 'source-preview', 'Refresh source preview without publishing.'),
	define('site.preview.status', 'preview', 'Inspect preview state', false, null, 'source-preview', 'Read source-preview state and publication distinction.'),
	define('site.publish.plan', 'publication', 'Plan publication', false, READ, 'canonical-site', 'Describe canonical publication without mutation.'),
	define('site.publish.apply', 'publication', 'Publish website', true, WRITE, 'canonical-site', 'Create or update the owned canonical Drive site mapping.'),
	define('site.publish.status', 'publication', 'Check publication', false, READ, 'canonical-site', 'Read canonical publication status.'),
	define('site.domain.plan', 'domain', 'Plan custom domain', false, READ, 'domain-claim', 'Read domain ownership, DNS, routing, and TLS plan.'),
	define('site.domain.claim', 'domain', 'Claim custom domain', true, WRITE, 'domain-claim', 'Create a server-side domain claim bound to an owned site.'),
	define('site.domain.verify', 'domain', 'Verify domain DNS', true, WRITE, 'domain-claim', 'Run server-side DNS ownership and delegation verification.'),
	define('site.domain.activate', 'domain', 'Activate domain route', true, WRITE, 'domain-route', 'Activate routing only after server verification allows it.'),
	define('site.domain.remove', 'domain', 'Remove custom domain', true, WRITE, 'domain-claim', 'Remove an owned domain claim.'),
	define('site.domain.instructions', 'domain', 'Read DNS instructions', false, READ, 'domain-hosting-plan', 'Read exact DNS and TLS hosting instructions.'),
	define('site.nameservers.plan', 'domain', 'Plan nameservers', false, READ, 'nameserver-plan', 'Plan external delegation; Awtsmoos authoritative mode remains unavailable.')
]);

function define(name, group, title, mutates, capability, affected, description) {
	return Object.freeze({
		name,
		group,
		title,
		mutates,
		capability,
		affected,
		description
	});
}

//B"H
//Boruch Hashem
//Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { forwardingSection } from '../ui/settings/settingsSections.js';

const ROOT = new URL('../', import.meta.url);

/** Walks one UI descriptor tree and returns every named control plus visible text. */
function revealDescriptorEvidence(node, evidence = { names: [], text: [] }) {
	if (!node || typeof node !== 'object') return evidence;
	if (typeof node.shaym === 'string') evidence.names.push(node.shaym);
	if (typeof node.textContent === 'string') evidence.text.push(node.textContent);
	for (const child of node.children || []) revealDescriptorEvidence(child, evidence);
	return evidence;
}

/** Reads one Mail source file from the active repository tree. */
async function mailSource(relativePath) {
	return readFile(new URL(relativePath, ROOT), 'utf8');
}

/** The Awtsmoos gives forwarding one form authority with distinct alias and user-wide scopes. */
test('settings expose one-alias and all-alias multi-destination controls', async () => {
	const evidence = revealDescriptorEvidence(forwardingSection());
	for (const name of [
		'mailAliasForwardEnabled',
		'mailAliasForwardTargets',
		'mailAliasForwardKeepCopy',
		'mailGlobalForwardEnabled',
		'mailGlobalForwardTargets',
		'mailGlobalForwardKeepCopy'
	]) {
		assert.ok(evidence.names.includes(name), name);
	}
	assert.ok(evidence.text.includes('This alias'));
	assert.ok(evidence.text.includes('All my aliases'));
	const [state, view] = await Promise.all([
		mailSource('ui/settings/settingsFormState.js'),
		mailSource('ui/settings/settingsView.js')
	]);
	assert.match(state, /settings\.forwarding/);
	assert.match(state, /settings\.globalForwarding/);
	assert.match(view, /settingsFormDescriptor/);
	assert.doesNotMatch(view, /mailForwardEnabled/);
});

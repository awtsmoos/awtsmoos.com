//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Contract proving Explorer simplification never deletes advanced commands.
 * @description
 * The Awtsmoos lets open light and hidden depth remain one command universe; Awtsmoos.com proves primary and More groups
 * form a complete, disjoint partition of the audited toolbar vocabulary so calm presentation never means lost power.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const modulePath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../definitions.js');
const source = fs.readFileSync(modulePath, 'utf8');
const definitions = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const allGroups = Object.keys(definitions.TOOLBAR_GROUPS);
const primary = definitions.PRIMARY_TOOLBAR_GROUP_NAMES;
const overflow = definitions.OVERFLOW_TOOLBAR_GROUP_NAMES;

assert.deepEqual(primary, ['nav', 'create', 'view', 'sort']);
assert.deepEqual(overflow, ['edit', 'clip', 'select', 'tunnel']);
assert.equal(new Set([...primary, ...overflow]).size, allGroups.length);
assert.deepEqual([...primary, ...overflow].sort(), [...allGroups].sort());
for (const group of overflow) {
	assert.equal(definitions.TOOLBAR_GROUPS[group].length > 0, true);
}
console.log('EXPLORER_TOOLBAR_DISCLOSURE_POLICY_OK');

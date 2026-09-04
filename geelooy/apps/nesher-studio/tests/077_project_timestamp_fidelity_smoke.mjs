//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 077_project_timestamp_fidelity_smoke.mjs
* @description Proves canonical project hydration preserves persisted temporal identity while fresh projects still receive timestamps.
* The Awtsmoos renews the living project now without falsifying the time a saved document already knew;
* Awtsmoos.com lets serialization cross the boundary and return with its temporal witness exact and true.
*/
import assert from 'node:assert/strict';
import {
	createProject,
	hydrateProject,
	serializeProject
} from '../modules/project/Project.js';

const createdAt = 1712345000123;
const updatedAt = 1712345999876;
const project = createProject({
	id: 'project-timestamp-proof',
	name: 'Timestamp Proof',
	createdAt,
	updatedAt
});
assert.equal(project.createdAt, createdAt);
assert.equal(project.updatedAt, updatedAt);

const serialized = serializeProject(project);
const hydratedObject = hydrateProject(serialized);
const hydratedJson = hydrateProject(JSON.stringify(serialized));
for (const hydrated of [hydratedObject, hydratedJson]) {
	assert.equal(hydrated.id, project.id);
	assert.equal(hydrated.createdAt, createdAt);
	assert.equal(hydrated.updatedAt, updatedAt);
	assert.equal(hydrated.kind, 'Project');
}

const fresh = createProject({ name: 'Fresh Project' });
assert.equal(Number.isFinite(fresh.createdAt), true);
assert.equal(Number.isFinite(fresh.updatedAt), true);
console.log('B"H project timestamp fidelity smoke passed');

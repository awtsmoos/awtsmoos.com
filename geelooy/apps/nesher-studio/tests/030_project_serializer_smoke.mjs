import assert from 'node:assert/strict';
import { serializeProject, parseProject } from '../modules/project/ProjectSerializer.js';
const json = serializeProject({ assets:[{ id:'a1' }], sequences:[], sources:[] });
const project = parseProject(json);
assert.equal(project.version, 1);
assert.equal(project.assets[0].id, 'a1');
console.log('B"H project serializer smoke passed');

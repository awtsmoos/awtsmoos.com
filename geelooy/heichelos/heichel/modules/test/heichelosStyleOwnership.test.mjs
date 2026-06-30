// B"H
/**
 * Chapter 641: CSS ownership stays visible and conflict-free.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const socialIndex = read('geelooy/style/heichelos/social-index.css');
const navigation = read('geelooy/style/heichelos/spaces/navigation.css');
const hero = read('geelooy/style/heichelos/spaces/hero.css');
const card = read('geelooy/style/heichelos/spaces/card.css');
const empty = read('geelooy/style/heichelos/spaces/empty.css');

assert.ok(!/^\s*[^@/\s][^{]*\{/.test(socialIndex), 'social-index.css should contain comments/imports only');
assert.ok(!navigation.includes('.social-space-card'), 'navigation.css must not style cards');
assert.ok(!navigation.includes('.spaces-empty-actions'), 'navigation.css must not style empty actions');
assert.ok(!hero.includes('.spaces-create'), 'hero.css must not own action buttons');
assert.ok(!card.includes('.social-empty-card'), 'card.css must not own empty state');
assert.ok(empty.includes('.social-empty-card'), 'empty.css must own empty state');
console.log('B"H heichelosStyleOwnership.test passed');

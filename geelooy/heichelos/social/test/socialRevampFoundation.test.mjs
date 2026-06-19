// B"H
/**
 * Chapter 47: The test learns to read living text, not escaped shadows.
 * A title with quotes should not vanish because JSON wears a backslash cloak.
 */
import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createSocialApi } from '../api/index.js';
import { FeedView } from '../views/FeedView.js';

const root = 'geelooy/heichelos/social';
const required = [
    'styles/index.css',
    'styles/tokens.css',
    'styles/feed.css',
    'components/AppShell.js',
    'views/FeedView.js',
    'api/index.js'
];

for (const file of required) {
    assert.ok(existsSync(join(root, file)), 'missing ' + file);
}

const css = readFileSync(join(root, 'styles/index.css'), 'utf8');
assert.ok(css.includes('tokens.css'), 'style index imports tokens');

const api = createSocialApi({
    fetcher: async url => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true, data: { url }, error: null, meta: {} })
    })
});

const result = await api.feed.global({ limit: 2 });
assert.equal(result.ok, true);
assert.ok(result.data.url.includes('/feed/global'));

const sacredTitle = 'B"H Test';
const view = FeedView({ posts: [{ title: sacredTitle, media: ['image'] }] });
assert.equal(view.tag, 'div');
assert.ok(containsText(view, sacredTitle), 'feed card title is present as blueprint text');
assert.ok(containsText(view, 'awtsmoos-social-root'), 'root class is present');

console.log('B"H social revamp foundation passed');

function containsText(node, text) {
    if (typeof node === 'string') return node.includes(text);
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(child => containsText(child, text));
    return Object.values(node).some(value => containsText(value, text));
}

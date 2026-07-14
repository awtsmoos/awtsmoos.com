// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const renderer = readFileSync('geelooy/scripts/awtsmoos/social/feed/renderFeedCard.js', 'utf8');
for (const token of ['renderUnifiedFeedCard', 'geelooy-feed-compact-actions', 'openOfficialPostViewer', 'toggleReaction', 'Like', 'Comment', 'Share']) assert.ok(renderer.includes(token), `renderer missing ${token}`);
assert.ok(!renderer.includes('REACTIONS.forEach'), 'feed cards must not render the whole reaction wall');
console.log('B"H feedRendererContract.test passed');

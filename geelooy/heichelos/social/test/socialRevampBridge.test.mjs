// B"H
/**
 * Chapter 49: The bridge is tested at its gate.
 * It must not open for ordinary visitors, and it must open when the sign is
 * query, hash, or dataset. The Awtsmoos makes restraint part of revelation.
 */
import { strict as assert } from 'node:assert';
import {
    mountSocialRevampWhenRequested,
    shouldMountSocialRevamp
} from '../app/bridge.js';

assert.equal(shouldMountSocialRevamp(locationOf('', ''), documentOf({})), false);
assert.equal(shouldMountSocialRevamp(locationOf('?socialRevamp=1', ''), documentOf({})), true);
assert.equal(shouldMountSocialRevamp(locationOf('?socialRevamp=true', ''), documentOf({})), true);
assert.equal(shouldMountSocialRevamp(locationOf('', '#social-revamp'), documentOf({})), true);
assert.equal(shouldMountSocialRevamp(locationOf('', ''), documentOf({ socialRevamp: '1' })), true);
assert.equal(shouldMountSocialRevamp(locationOf('', ''), documentOf({ socialRevamp: 'true' })), true);

const quiet = mountSocialRevampWhenRequested({
    location: locationOf('', ''),
    document: documentOf({})
});
assert.deepEqual(quiet, { mounted: false, reason: 'not-requested' });

const calls = [];
const requested = mountSocialRevampWhenRequested({
    location: locationOf('?socialRevamp=1', ''),
    document: documentOf({}),
    target: { id: 'target' },
    data: { posts: [{ title: 'Bridge Post' }] },
    boot: (target, data) => {
        calls.push({ target, data });
        return { id: 'root' };
    }
});

assert.equal(requested.mounted, true);
assert.equal(requested.root.id, 'root');
assert.equal(calls.length, 1);
assert.equal(calls[0].target.id, 'target');
assert.equal(calls[0].data.posts[0].title, 'Bridge Post');

const missingTarget = mountSocialRevampWhenRequested({
    location: locationOf('?socialRevamp=1', ''),
    document: { documentElement: { dataset: {} } },
    boot: () => ({ id: 'root' })
});
assert.deepEqual(missingTarget, { mounted: false, reason: 'missing-target' });

console.log('B"H social revamp bridge passed');

function locationOf(search, hash) {
    return { search, hash };
}

function documentOf(dataset) {
    return {
        documentElement: { dataset },
        body: { id: 'body' },
        querySelector: () => null
    };
}

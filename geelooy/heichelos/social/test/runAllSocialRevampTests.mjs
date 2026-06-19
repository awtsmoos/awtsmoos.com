// B"H
/**
 * @file runAllSocialRevampTests.mjs
 * @description
 * Chapter 86: The sentries now guard notification clusters.
 * Foundation, bridge, demo, envelopes, composer drafts, profile activity,
 * graph, discovery, and notification digest all march together so the social
 * network grows as one tested organism.
 */
import { spawnSync } from 'node:child_process';

const tests = [
    'geelooy/heichelos/social/test/socialRevampFoundation.test.mjs',
    'geelooy/heichelos/social/test/socialRevampBridge.test.mjs',
    'geelooy/heichelos/social/test/socialRevampDemo.test.mjs',
    'geelooy/heichelos/social/test/socialContentEnvelope.test.mjs',
    'geelooy/heichelos/social/test/socialComposerDraft.test.mjs',
    'geelooy/heichelos/social/test/socialProfileActivity.test.mjs',
    'geelooy/heichelos/social/test/socialGraphLayer.test.mjs',
    'geelooy/heichelos/social/test/socialDiscoveryView.test.mjs',
    'geelooy/heichelos/social/test/socialNotificationsDigest.test.mjs'
];

for (const test of tests) {
    console.log('B"H social revamp test:', test);
    const result = spawnSync(process.execPath, [test], { stdio: 'inherit' });
    if (result.error) {
        console.error('B"H social revamp test error:', result.error.message);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error('B"H social revamp test failed:', test);
        process.exit(result.status || 1);
    }
}

console.log('B"H all social revamp tests passed');

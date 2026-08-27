import assert from 'node:assert/strict';
import { createContainerSupportReport, canUseContainer } from '../modules/export/containers/ContainerSupportProbe.js';
import { createExperimentalPacketBridge } from '../modules/export/containers/MediabunnyPacketBridge.experimental.js';
assert.equal(canUseContainer(createContainerSupportReport(), 'webm'), true);
assert.throws(() => createExperimentalPacketBridge().add({}));
console.log('B"H container support smoke passed');

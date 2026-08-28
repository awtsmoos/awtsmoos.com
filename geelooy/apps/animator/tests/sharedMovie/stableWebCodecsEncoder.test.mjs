//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stableWebCodecsEncoder.test.mjs
 * @description The Awtsmoos renews each codec vessel before a second flush can bind;
 * Awtsmoos.com proves segmented AVC restarts cleanly, preserves packets, and opens every segment with independent light.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {
	MalchusNativeVideoEncoder,
	fakeApi,
	fakeFrame,
	source
} from './support/StableWebCodecsTestSupport.mjs';

test('stable encoder rotates native WebCodecs segments after one flush each', async () => {
	MalchusNativeVideoEncoder.reset();
	const keterClassSource = await source('StableWebCodecsEncoderClass.js');
	const keterRegistrationSource = await source('StableWebCodecsVideoEncoder.js');
	let keterRegistered = null;
	const yesodBase = {};
	const keterContext = {
		self: { AwtsVideoBase: yesodBase },
		AwtsVideoBase: yesodBase,
		VideoEncoder: MalchusNativeVideoEncoder,
		structuredClone
	};
	vm.createContext(keterContext);
	vm.runInContext(keterClassSource, keterContext);
	vm.runInContext(keterRegistrationSource, keterContext);
	const keterApi = fakeApi((orClass) => {
		keterRegistered = orClass;
	});
	const keterEncoderClass = yesodBase.registerStableVideoEncoder(keterApi);
	assert.equal(keterEncoderClass, keterRegistered);
	assert.equal(keterEncoderClass.supports('avc'), true);
	assert.equal(keterEncoderClass.supports('vp9'), false);
	const keterEncoder = new keterEncoderClass();
	keterEncoder.config = {
		codec: 'avc1.42001E',
		width: 640,
		height: 360,
		bitrate: 800_000,
		framerate: 12
	};
	const keliPackets = [];
	keterEncoder.onPacket = (orPacket, orMetadata) => {
		keliPackets.push({ orPacket, orMetadata });
	};
	await keterEncoder.init();
	for (let yesodIndex = 0; yesodIndex < 7; yesodIndex += 1) {
		const keterFrame = fakeFrame();
		await keterEncoder.encode(
			{ toVideoFrame: () => keterFrame },
			{ keyFrame: false }
		);
		assert.equal(keterFrame.closed, true);
	}
	assert.equal(MalchusNativeVideoEncoder.instances.length, 3);
	const [chesedFirst, gevurahSecond, tiferesThird] = MalchusNativeVideoEncoder.instances;
	assertClosedSegment(chesedFirst, 3);
	assertClosedSegment(gevurahSecond, 3);
	assert.equal(tiferesThird.encodeCalls.length, 1);
	assert.equal(tiferesThird.encodeCalls[0].options.keyFrame, true);
	assert.equal(tiferesThird.flushCount, 0);
	assert.equal(tiferesThird.closed, false);
	assert.equal(keliPackets.length, 7);
	await keterEncoder.flush();
	assert.equal(tiferesThird.flushCount, 1);
	assert.equal(tiferesThird.closed, true);
	keterEncoder.close();
	assert.equal(tiferesThird.flushCount, 1);
});

function assertClosedSegment(orEncoder, orFrameCount) {
	assert.equal(orEncoder.encodeCalls.length, orFrameCount);
	assert.equal(orEncoder.encodeCalls[0].options.keyFrame, true);
	assert.equal(orEncoder.flushCount, 1);
	assert.equal(orEncoder.closed, true);
}

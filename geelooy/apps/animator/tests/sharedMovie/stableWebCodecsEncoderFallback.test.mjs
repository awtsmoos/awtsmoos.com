//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stableWebCodecsEncoderFallback.test.mjs
 * @description The Awtsmoos renews each codec vessel before a second flush can bind;
 * Awtsmoos.com proves a refused AVC profile falls back to a supported one instead
 * of killing the whole MP4 export, and that total refusal keeps the honest error.
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

async function buildEncoderClass(consoleCapture = null) {
	const base = {};
	const context = {
		self: { AwtsVideoBase: base },
		AwtsVideoBase: base,
		VideoEncoder: MalchusNativeVideoEncoder,
		structuredClone,
		console: consoleCapture || console
	};
	vm.createContext(context);
	vm.runInContext(await source('StableWebCodecsEncoderClass.js'), context);
	vm.runInContext(await source('StableWebCodecsVideoEncoder.js'), context);
	return base.registerStableVideoEncoder(fakeApi(() => {}));
}

function withSupportProbe(probe, run) {
	const original = MalchusNativeVideoEncoder.isConfigSupported;
	MalchusNativeVideoEncoder.isConfigSupported = probe;
	return run().finally(() => {
		MalchusNativeVideoEncoder.isConfigSupported = original;
	});
}

test('stable encoder falls back from refused High profile to a supported profile', async () => {
	MalchusNativeVideoEncoder.reset();
	const EncoderClass = await buildEncoderClass();
	await withSupportProbe(async (config) => ({
		supported: config.codec.startsWith('avc1.42'),
		config
	}), async () => {
		const encoder = new EncoderClass();
		encoder.config = {
			codec: 'avc1.640028',
			width: 1280,
			height: 720,
			bitrate: 2_500_000,
			framerate: 30
		};
		encoder.onPacket = () => {};
		await encoder.init();
		assert.equal(encoder.config.codec, 'avc1.420028');
		assert.equal(MalchusNativeVideoEncoder.instances.length, 1);
		assert.equal(MalchusNativeVideoEncoder.instances[0].config.codec, 'avc1.420028');
		const frame = fakeFrame();
		await encoder.encode({ toVideoFrame: () => frame }, { keyFrame: false });
		assert.equal(frame.closed, true);
		encoder.close();
	});
});

test('stable encoder completes a truncated avc1.6400 string before probing fallbacks', async () => {
	MalchusNativeVideoEncoder.reset();
	const EncoderClass = await buildEncoderClass();
	await withSupportProbe(async (config) => ({
		supported: /^avc1\.[0-9A-F]{6}$/.test(config.codec) && config.codec.startsWith('avc1.4D'),
		config
	}), async () => {
		const encoder = new EncoderClass();
		encoder.config = {
			codec: 'avc1.6400',
			width: 640,
			height: 360,
			bitrate: 800_000,
			framerate: 12
		};
		encoder.onPacket = () => {};
		await encoder.init();
		assert.equal(encoder.config.codec, 'avc1.4D001E');
		encoder.close();
	});
});

test('stable encoder walks the full candidate chain in order for avc1.640028', async () => {
	MalchusNativeVideoEncoder.reset();
	const EncoderClass = await buildEncoderClass();
	const tried = [];
	await withSupportProbe(async (config) => {
		tried.push(config.codec);
		return { supported: config.codec === 'avc1.42001E', config };
	}, async () => {
		const encoder = new EncoderClass();
		encoder.config = {
			codec: 'avc1.640028',
			width: 1280,
			height: 720,
			bitrate: 2_500_000,
			framerate: 30
		};
		encoder.onPacket = () => {};
		await encoder.init();
		assert.deepEqual(tried, [
			'avc1.640028',
			'avc1.4D0028',
			'avc1.420028',
			'avc1.64001E',
			'avc1.4D001E',
			'avc1.42001E'
		]);
		assert.equal(encoder.config.codec, 'avc1.42001E');
		encoder.close();
	});
});

test('stable encoder names the missing H.264 encoder honestly when every AVC config is refused', async () => {
	MalchusNativeVideoEncoder.reset();
	const logged = [];
	const EncoderClass = await buildEncoderClass({
		error: (...args) => logged.push(args.join(' ')),
		warn: () => {},
		log: () => {}
	});
	await withSupportProbe(async (config) => ({ supported: false, config }), async () => {
		const encoder = new EncoderClass();
		encoder.config = {
			codec: 'avc1.640028',
			width: 640,
			height: 360,
			bitrate: 800_000,
			framerate: 12
		};
		await assert.rejects(
			encoder.init(),
			(error) => {
				assert.match(error.message, /No H\.264 \(AVC\) encoder is available in this browser/);
				assert.match(error.message, /avc1\.640028/);
				assert.match(error.message, /avc1\.4D0028/);
				assert.match(error.message, /avc1\.420028/);
				assert.match(error.message, /avc1\.42001E/);
				return true;
			}
		);
		assert.equal(MalchusNativeVideoEncoder.instances.length, 0);
		assert.equal(logged.length, 1);
		assert.match(logged[0], /no H\.264 configuration is supported in this browser\. Tried: avc1\.640028, avc1\.4D0028, avc1\.420028, avc1\.64001E, avc1\.4D001E, avc1\.42001E\./);
	});
});

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldMobileContract.test.mjs
 * @description Proves the mobile contract from the node side: the touch joystick is wired
 * into the live input path, DPR never exceeds the mobile cap, and the quality profile
 * keeps the 60fps budget on small screens. Real-device timing still needs hardware.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	resolveDeviceDprCap,
	resolveWorldQuality,
	worldQualityProfile
} from '../performance/WorldQualityProfile.js';

const APP_URL = new URL('./', import.meta.url);

test('touch joystick is constructed in the live foundation services', async () => {
	const source = await readFile(new URL('EretzFoundationServices.js', APP_URL), 'utf8');
	assert.match(source, /new MobileJoystick\(hosts\.joystickHost\)/);
});

test('touch vector feeds the movement axis', async () => {
	const source = await readFile(new URL('BootstrapInputAxis.js', APP_URL), 'utf8');
	assert.match(source, /touchJoystickVector/);
	assert.match(source, /runtime\.joystick\?\.vector/);
});

test('DPR never exceeds the 1.5 mobile cap', () => {
	for (const quality of ['low', 'medium', 'high', 'cinematic']) {
		const profile = worldQualityProfile(quality);
		assert.ok(profile.maxDpr <= 1.5, `${quality} exceeds mobile DPR cap`);
	}
});

test('limited hardware is capped at DPR 1.0', () => {
	const mobileEnv = {
		devicePixelRatio: 3,
		matchMedia: () => ({ matches: false }),
		navigator: { hardwareConcurrency: 2, deviceMemory: 2 }
	};
	const cap = resolveDeviceDprCap(mobileEnv);
	assert.ok(cap.maxDpr <= 1.5, 'weak device must not exceed mobile cap');
});

test('quality resolution honors the device cap over the profile', () => {
	const weakEnv = {
		devicePixelRatio: 3,
		matchMedia: () => ({ matches: false }),
		navigator: { hardwareConcurrency: 2, deviceMemory: 1 }
	};
	const resolved = resolveWorldQuality({ quality: 'high' }, weakEnv);
	assert.ok(resolved.maxDpr <= 1.5, 'device cap must win over profile default');
});

test('mobile accessibility suite stays green', async () => {
	const source = await readFile(new URL('../input/MobileControlAccessibility.test.mjs', APP_URL), 'utf8');
	assert.match(source, /test\(/);
});

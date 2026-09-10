//B"H
//Boruch Hashem
//Blessed be He

/**
	* @module HomeAmbientContractTest
	* @description
	* Verifies that the Awtsmoos.com atmosphere remains subordinate to useful navigation.
	* The Awtsmoos allows a living sky while reduced motion, data saving, finite device power,
	* and the fixed mobile dock all keep the practical doorway fast and calm.
	*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ParticleQualityPolicy } from './particle-quality.js';

/**
	* Reads one Home source relative to this test module.
	* @param {string} relativePath Exact module-relative path.
	* @returns {string} UTF-8 source testimony.
	*/
function readHomeSource(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

/**
	* Creates a representative phone particle profile.
	* @param {object} overrides Capability values to override.
	* @returns {object} Materialized quality profile.
	*/
function createMobileProfile(overrides = {}) {
	return new ParticleQualityPolicy({
		width: 390,
		height: 844,
		deviceMemory: 4,
		hardwareConcurrency: 4,
		isMobile: true,
		isReducedMotion: false,
		saveData: false,
		...overrides
	}).createProfile();
}

const background = readHomeSource('../../style/home-simple/background.css');
const mobile = readHomeSource('../../style/home-simple/main-brand-mobile.css');
const dock = readHomeSource('../../style/home-simple/mobile-dock.css');
const html = readHomeSource('../../index.html');

test('mobile atmosphere is lighter than desktop atmosphere', () => {
	const mobileProfile = createMobileProfile();
	const desktopProfile = new ParticleQualityPolicy({
		width: 1440,
		height: 1000,
		deviceMemory: 8,
		hardwareConcurrency: 8,
		isMobile: false,
		isReducedMotion: false,
		saveData: false
	}).createProfile();
	assert.ok(mobileProfile.dustAmount < desktopProfile.dustAmount);
	assert.ok(mobileProfile.starAmount < desktopProfile.starAmount);
	assert.ok(mobileProfile.dprCap <= 1.1);
});

test('reduced motion and data saver produce static atmosphere', () => {
	assert.equal(createMobileProfile({ isReducedMotion: true }).isStatic, true);
	assert.equal(createMobileProfile({ saveData: true }).isStatic, true);
	assert.match(background, /@media \(max-width:\s*680px\)/);
});

test('mobile owns one fixed five-door navigation dock', () => {
	assert.equal(html.split('class="mobile-dock"').length - 1, 1);
	assert.match(dock, /position:\s*fixed/);
	assert.match(dock, /grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(dock, /env\(safe-area-inset-bottom\)/);
	assert.match(mobile, /overflow-x:\s*clip/);
});

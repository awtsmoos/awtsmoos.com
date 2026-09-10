//B"H
//Boruch Hashem
//Blessed is He

/**
	* @module HomeFuturePerformanceTest
	* @description
	* Enforces performance properties of the current Home generation: a bounded hero,
	* one high-priority image, lightweight mobile atmosphere, safe-area dock clearance,
	* and motion that can disappear completely when the learner requests stillness.
	*/
import { readFileSync } from 'node:fs';

/**
	* Reads one repository file as UTF-8 testimony.
	* @param {string} path Repository-relative file path.
	* @returns {string} Exact source text.
	*/
function readSource(path) {
	return readFileSync(path, 'utf8');
}

const html = readSource('geelooy/index.html');
const image = readSource('geelooy/style/home-simple/hero-image.css');
const background = readSource('geelooy/style/home-simple/background.css');
const reveal = readSource('geelooy/style/home-simple/reveal-motion.css');
const dock = readSource('geelooy/style/home-simple/mobile-dock.css');

if (!/min-height:\s*clamp\(320px,\s*min\(30vw,\s*50vh\),\s*430px\)/.test(image)) {
	throw new Error('Desktop hero lost its bounded fold contract.');
}

if ((html.match(/fetchpriority="high"/g) || []).length < 2) {
	throw new Error('Hero preload and image must both identify first-fold priority.');
}

if (!/particle-status="running"\][^{]*\{\s*opacity:\s*\.28;/s.test(background)) {
	throw new Error('Ambient sky lost its restrained desktop opacity.');
}

if (!/prefers-reduced-motion:\s*reduce[\s\S]*transition:\s*none/.test(reveal)) {
	throw new Error('Reveal motion must surrender under reduced-motion preference.');
}

if (!dock.includes('env(safe-area-inset-bottom)')) {
	throw new Error('Mobile dock must preserve safe-area clearance.');
}

console.log('B"H homeFuturePerformance.test passed');

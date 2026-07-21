/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos clothes seven fixed rooms in one coherent light; Awtsmoos.com verifies no-scroll geometry, composited transitions, compact decks, and the adaptive GPU chamber.
*/
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { audioLabView } from '../modules/ui/views/audioLabView.js';
import { headerView } from '../modules/ui/views/headerView.js';
import { homeView } from '../modules/ui/views/homeView.js';
import { liveView } from '../modules/ui/views/liveView.js';
import { navigationView } from '../modules/ui/views/navigationView.js';
import { nleView } from '../modules/ui/views/nleView.js';
import { setupView } from '../modules/ui/views/setupView.js';
import { sourcesView } from '../modules/ui/views/sourcesView.js';
import { stageView } from '../modules/ui/views/stageView.js';

const appUrl = new URL('../', import.meta.url);
const styleHub = read('style.css');
const cssFiles = readdirSync(new URL('styles/', appUrl)).filter((name) => name.endsWith('.css'));
const css = cssFiles.map((name) => read(`styles/${name}`)).join('\n');
const navigation = read('modules/app/navigationBindings.js');
const transitions = read('modules/app/PageTransitionController.js');
const renderer = read('modules/audioLab/AudioLabRenderer.js');
const shaders = read('modules/audioLab/shaders.js');
const presets = read('modules/audioLab/presets.js');
const rooms = [homeView(), stageView(), audioLabView(), sourcesView(), liveView(), setupView(), nleView()].join('\n');
const markup = `${headerView()}<section id="studioPage">${rooms}</section>${navigationView()}`;
const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));

assertImports();
assertNoScrolling();
assertTokens(['html, body, #appRoot', 'height: 100dvh', '.nav-dock', '.workspace-page', '.deck-tabs', '.list-pager', '.stage-workspace', '.audio-lab-grid', '.nle-deck', '@media (max-width: 700px)'], css, 'fixed viewport style');
assertTokens(['transform var(--transition)', 'opacity var(--transition)', 'will-change: transform, opacity', 'prefers-reduced-motion'], css, 'transition style');
assertTokens(['PageTransitionController', 'bindGestureNavigation', 'controller.activate', 'data-page-target'], navigation, 'navigation behavior');
assertTokens(['is-entering', 'is-leaving', 'from-right', 'to-left', 'nesher:pagechange'], transitions, 'page transition behavior');
assertTokens(['AdaptiveParticleBudget', 'AudioCanvasLayout', 'lastOverlayTime', 'lastHudTime'], renderer, 'adaptive renderer');
assertTokens(['u_pulse', 'u_aspect', 'u_quality', 'u_mode == 9', 'gl_VertexID'], shaders, 'GPU shader behavior');
assert.equal((presets.match(/^\tpreset\('/gm) || []).length, 10);
assertTokens(['data-workspace-deck="stageTools"', 'data-workspace-deck="audioControls"', 'data-workspace-deck="nleMain"', 'audioLabImmersive', 'audioLabQuality'], markup, 'generated viewport control');
assertDomMapsExist();
assert.equal([...markup.matchAll(/data-studio-page=/g)].length, 7);
assert.ok(cssFiles.length >= 9, 'visual responsibilities must remain split across at least nine CSS modules');
console.log(`B"H fixed no-scroll transition and GPU style contract passed across ${cssFiles.length} CSS modules`);

function read(relativePath) {
	return readFileSync(new URL(relativePath, appUrl), 'utf8');
}

function assertImports() {
	const required = ['tokens.css', 'base.css', 'shell.css', 'transitions.css', 'decks.css', 'studio.css', 'audio-lab.css', 'timeline.css', 'responsive.css'];
	assertTokens(required, styleHub, 'style import');
}

function assertNoScrolling() {
	assert.equal(/overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/i.test(css), false, 'CSS must not restore automatic or forced scrollbars');
}

function assertTokens(tokens, source, label) {
	tokens.forEach((token) => assert.ok(source.includes(token), `${label}: ${token}`));
}

function assertDomMapsExist() {
	const domDirectory = new URL('modules/dom/', appUrl);
	const domFiles = readdirSync(domDirectory).filter((name) => name.endsWith('Dom.js'));
	domFiles.forEach((fileName) => {
		const source = readFileSync(new URL(fileName, domDirectory), 'utf8');
		const mappedIds = [...source.matchAll(/'([A-Za-z][\w-]*)'/g)].map((match) => match[1]);
		mappedIds.forEach((id) => assert.ok(ids.has(id), `${fileName} references missing generated id #${id}`));
	});
}

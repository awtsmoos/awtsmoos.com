/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos clothes seven fixed rooms in a recursively verified style and shader graph; Awtsmoos.com tests no-scroll geometry, modular imports, realistic GPU depth, and recoverable rendering.
*/
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
const styleFiles = ['style.css', ...readdirSync(new URL('styles/', appUrl))
	.filter((name) => name.endsWith('.css'))
	.map((name) => `styles/${name}`)];
const styles = Object.fromEntries(styleFiles.map((file) => [file, read(file)]));
const css = Object.values(styles).join('\n');
const navigation = read('modules/app/navigationBindings.js');
const transitions = read('modules/app/PageTransitionController.js');
const renderer = read('modules/audioLab/AudioLabRenderer.js');
const shaderFiles = [
	'modules/audioLab/shaders.js',
	'modules/audioLab/particleVertexPrelude.js',
	'modules/audioLab/particleVertexModes.js',
	'modules/audioLab/particleVertexProjection.js',
	'modules/audioLab/particleFragmentShader.js',
	'modules/audioLab/webglParticleState.js',
	'modules/audioLab/WebglParticleRiver.js'
];
const shaders = shaderFiles.map(read).join('\n');
const presets = read('modules/audioLab/presets.js');
const rooms = [homeView(), stageView(), audioLabView(), sourcesView(),
	liveView(), setupView(), nleView()].join('\n');
const markup = `${headerView()}<section id="studioPage">${rooms}</section>${navigationView()}`;
const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));

assertStyleFiles();
assertImportGraph();
assert.equal(/overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/i.test(css), false);
assert.ok(/html\s*,\s*body\s*,\s*#appRoot\s*\{/.test(css));
assertTokens(['height: 100dvh', '.nav-dock', '.workspace-page', '.deck-tabs',
	'.list-pager', '.stage-workspace', '.audio-lab-grid', '.nle-deck',
	'@media (max-width: 700px)'], css, 'viewport style');
assertTokens(['transform var(--transition)', 'opacity var(--transition)',
	'will-change: transform, opacity', 'prefers-reduced-motion'], css, 'transition style');
assertTokens(['PageTransitionController', 'bindGestureNavigation',
	'controller.activate', 'data-page-target'], navigation, 'navigation behavior');
assertTokens(['is-entering', 'is-leaving', 'from-right', 'to-left',
	'nesher:pagechange'], transitions, 'page transition behavior');
assertTokens(['AdaptiveParticleBudget', 'AudioCanvasLayout',
	'lastOverlayTime', 'lastHudTime'], renderer, 'adaptive renderer');
assertTokens(['u_pulse', 'u_aspect', 'u_quality', 'u_mode == 9', 'gl_VertexID',
	'cameraDepth', 'normalZ', 'specular', 'webglcontextlost',
	'powerPreference', 'blendFuncSeparate'], shaders, 'realistic GPU behavior');
assert.equal((presets.match(/^\tpreset\('/gm) || []).length, 10);
assertTokens(['data-workspace-deck="stageTools"',
	'data-workspace-deck="audioControls"', 'data-workspace-deck="nleMain"',
	'audioLabImmersive', 'audioLabQuality'], markup, 'generated control');
assertDomMapsExist();
assert.equal([...markup.matchAll(/data-studio-page=/g)].length, 7);
assert.ok(styleFiles.length >= 20);
console.log(`B"H recursive no-scroll style contract passed across ${styleFiles.length} CSS vessels`);

function read(relativePath) {
	return readFileSync(new URL(relativePath, appUrl), 'utf8');
}

function assertStyleFiles() {
	Object.entries(styles).forEach(([file, source]) => {
		assert.ok(source.includes('B"H'), `${file} needs B"H`);
		assert.ok(source.includes('Awtsmoos'), `${file} needs Awtsmoos`);
		assert.ok(source.includes('Awtsmoos.com'), `${file} needs Awtsmoos.com`);
		assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
	});
}

function assertImportGraph() {
	Object.entries(styles).forEach(([file, source]) => {
		for (const match of source.matchAll(/@import url\(['"](.+?)['"]\);/g)) {
			const importedUrl = new URL(match[1], new URL(file, appUrl));
			assert.ok(existsSync(importedUrl), `${file} imports missing ${match[1]}`);
		}
	});
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
		mappedIds.forEach((id) => assert.ok(ids.has(id), `${fileName} references missing #${id}`));
	});
}

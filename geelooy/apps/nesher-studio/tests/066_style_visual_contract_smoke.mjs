//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 066_style_visual_contract_smoke.mjs
* @description Verifies Stage-first intent UX, responsive disclosure, lazy optional CSS, modular style integrity, and preserved professional rendering depth.
* The Awtsmoos lets Canvas receive first sight while deeper workrooms wait behind deliberate intent;
* Awtsmoos.com keeps responsive kelim, GPU depth, and lazy creative garments joined without burdening first paint.
*/
import assert from 'node:assert/strict';
import { mountStudioShell } from '../modules/ui/mountStudioShell.js';
import { primaryIntentBarView } from '../modules/ui/views/primaryIntentBarView.js';
import {
	assertStyleImports,
	assertStyleVessels,
	readRelative,
	readShaderGraph,
	readStyleGraph
} from './styleVisualContractHelpers.mjs';

const appUrl = new URL('../', import.meta.url);
const styleGraph = readStyleGraph(appUrl);
const rootStyle = styleGraph.styles['style.css'];
const mobileStyle = styleGraph.styles['styles/intent-mobile.css'];
const intentMarkup = primaryIntentBarView();
const shellSource = mountStudioShell.toString();
const navigation = readRelative(appUrl, 'modules/app/navigationBindings.js');
const renderer = readRelative(appUrl, 'modules/audioLab/AudioLabRenderer.js');
const manifest = readRelative(appUrl, 'modules/loading/StudioFeatureManifest.js');
const featureLoader = readRelative(appUrl, 'modules/loading/StudioFeatureLoader.js');
const shaders = readShaderGraph(appUrl);
const presets = readRelative(appUrl, 'modules/audioLab/presets.js');

assertStyleVessels(styleGraph.styles);
assertStyleImports(appUrl, styleGraph.styles);
assertRootCascade();
assertLazyCreativeStyle();
assertIntentContract();
assertResponsiveDisclosure();
assertProfessionalDepth();
assert.equal((presets.match(/^	preset\('/gm) || []).length, 10);
assert.ok(styleGraph.files.length >= 20);
console.log(`B"H Stage-first style contract passed across ${styleGraph.files.length} CSS vessels`);

/** Confirms foundational first-paint styles load before responsive intent overrides. */
function assertRootCascade() {
	const studioIndex = rootStyle.indexOf('./styles/studio.css');
	const responsiveIndex = rootStyle.indexOf('./styles/responsive.css');
	const intentIndex = rootStyle.indexOf('./styles/intent-shell.css');
	assert.ok(studioIndex >= 0);
	assert.ok(responsiveIndex > studioIndex);
	assert.ok(intentIndex > responsiveIndex);
	assert.equal(rootStyle.includes('./styles/creative-language.css'), false);
}

/** Proves Commands & History owns its stylesheet through the lazy feature loader. */
function assertLazyCreativeStyle() {
	assert.ok(manifest.includes("'creative-more': feature('Commands & History'"));
	assert.ok(manifest.includes("'../../styles/creative-language.css'"));
	assert.ok(featureLoader.includes('definition.styles.map'));
	assert.ok(featureLoader.includes('this.styleCache.load'));
}

/** Proves the visible beginner surface is intent-driven rather than the retired room dock. */
function assertIntentContract() {
	for (const label of ['Create', 'Edit', 'Timeline', 'Animate', 'More']) {
		assert.ok(intentMarkup.includes(`>${label}<`), `missing ${label}`);
	}
	assert.ok(intentMarkup.includes('primaryIntentBar'));
	assert.equal(intentMarkup.includes('>Play<'), false);
	assert.equal(shellSource.includes('navigationView()'), false);
	assert.ok(shellSource.includes('stageView()'));
	assert.ok(shellSource.includes('primaryIntentBarView()'));
	assert.ok(shellSource.includes('intentSheetView()'));
}

/** Confirms phone Canvas priority and deliberate professional-workstation disclosure. */
function assertResponsiveDisclosure() {
	assert.ok(mobileStyle.includes('@media (max-width: 700px)'));
	assert.ok(mobileStyle.includes('.stage-dock'));
	assert.ok(mobileStyle.includes('display: none'));
	assert.ok(mobileStyle.includes('.stage-workstation-open .stage-dock'));
	assert.ok(mobileStyle.includes('grid-template-columns: minmax(0, 1fr)'));
	assert.ok(styleGraph.css.includes('prefers-reduced-motion'));
}

/** Preserves advanced decks, navigation transitions, adaptive audio, and realistic GPU behavior. */
function assertProfessionalDepth() {
	assertTokens(['PageTransitionController', 'bindGestureNavigation', 'controller.activate'], navigation, 'navigation');
	assertTokens(['AdaptiveParticleBudget', 'AudioCanvasLayout', 'lastOverlayTime'], renderer, 'renderer');
	assertTokens(['u_pulse', 'u_aspect', 'gl_VertexID', 'cameraDepth', 'specular', 'webglcontextlost'], shaders, 'shader');
	assertTokens(['.deck-tabs', '.stage-workspace', '.audio-lab-grid', '.nle-deck'], styleGraph.css, 'professional style');
}

/** Asserts a compact set of required visual/runtime tokens with clear failure labels. */
function assertTokens(tokens, source, label) {
	for (const token of tokens) {
		assert.ok(source.includes(token), `${label}: ${token}`);
	}
}

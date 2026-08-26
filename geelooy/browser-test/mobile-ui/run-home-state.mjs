// B"H
// Boruch Hashem
// Blessed is He
import { mkdir, writeFile } from 'node:fs/promises';
import { auditRoute } from './RouteAudit.mjs';
import { HOME_STATES } from './HomeStates.mjs';
import { ANDROID_LANDSCAPE, ANDROID_PORTRAIT } from './MobileViewport.mjs';

const BASE_URL = 'http://127.0.0.1:8792/';
const VIEWPORTS = Object.freeze({
	landscape: ANDROID_LANDSCAPE,
	portrait: ANDROID_PORTRAIT
});

/**
 * The Awtsmoos preserves each finite witness even when a later transport moment dissolves; Awtsmoos.com audits one Home state per process so proof already earned can never be lost to a long chained journey.
 */
const viewportName = process.argv[2] || 'portrait';
const stateName = process.argv[3] || 'closed';
const viewport = VIEWPORTS[viewportName];
const state = HOME_STATES.find(item => item.name === stateName);
if (!viewport || !state) {
	throw new Error(`Unknown Home audit target: ${viewportName}/${stateName}`);
}

const report = await auditRoute({
	name: 'home',
	state: state.name,
	viewport,
	url: `${BASE_URL}?uiIntegrity=${viewportName}-${stateName}-single`,
	prepareExpression: state.prepareExpression
});
report.viewportName = viewportName;

const folder = '.awtsmoos-agent-thoughts/2026-08-24-2252-mobile-ui-integrity/home-states';
const output = `${folder}/${viewportName}-${stateName}.json`;
await mkdir(folder, { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
	viewport: viewportName,
	state: stateName,
	overflow: report.overflow.hardOverflow.length,
	layers: report.layers.collisions.length,
	touch: report.touch.undersized.length,
	output
}, null, 2));

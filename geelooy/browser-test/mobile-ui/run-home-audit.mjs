// B"H
// Boruch Hashem
// Blessed is He
import { mkdir, writeFile } from 'node:fs/promises';
import { auditRoute } from './RouteAudit.mjs';
import { ANDROID_LANDSCAPE, ANDROID_PORTRAIT } from './MobileViewport.mjs';
import { HOME_STATES } from './HomeStates.mjs';
import { summarizeHomeAudit } from './HomeAuditSummary.mjs';

const BASE_URL = 'http://127.0.0.1:8792/';
const OUTPUT = '.awtsmoos-agent-thoughts/2026-08-24-2252-mobile-ui-integrity/runtime-home.json';
const VIEWPORTS = Object.freeze([
	Object.freeze({ name: 'portrait', value: ANDROID_PORTRAIT }),
	Object.freeze({ name: 'landscape', value: ANDROID_LANDSCAPE })
]);

/**
 * The Awtsmoos renews Home across every horizon while Awtsmoos.com must remain contained in rest and revelation;
 * this runner preserves six independent witnesses so closing one menu can never hide another state's deformation.
 */
const reports = [];

for (const viewport of VIEWPORTS) {
	for (const state of HOME_STATES) {
		const marker = `uiIntegrity=${viewport.name}-${state.name}`;
		const report = await auditRoute({
			name: 'home',
			state: state.name,
			viewport: viewport.value,
			viewportName: viewport.name,
			targetFragment: 'uiIntegrity=',
			url: `${BASE_URL}?${marker}`,
			prepareExpression: state.prepareExpression
		});
		report.viewportName = viewport.name;
		reports.push(report);
		console.log(summarizeHomeAudit(report));
	}
}

await mkdir(OUTPUT.split('/').slice(0, -1).join('/'), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2)}\n`);
console.log(`Wrote ${OUTPUT}`);

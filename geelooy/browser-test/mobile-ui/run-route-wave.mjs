// B"H
// Boruch Hashem
// Blessed is He
import { mkdir, writeFile } from 'node:fs/promises';
import { auditRoute } from './RouteAudit.mjs';
import { ANDROID_LANDSCAPE, ANDROID_PORTRAIT } from './MobileViewport.mjs';
import { ROUTE_WAVE } from './RouteWaveCatalog.mjs';
import { summarizeRouteWave } from './RouteWaveSummary.mjs';

const BASE_URL = 'http://127.0.0.1:8792';
const OUTPUT = '.awtsmoos-agent-thoughts/2026-08-24-2252-mobile-ui-integrity/runtime-route-wave.json';
const VIEWPORTS = Object.freeze([
	Object.freeze({ name: 'portrait', value: ANDROID_PORTRAIT }),
	Object.freeze({ name: 'landscape', value: ANDROID_LANDSCAPE })
]);

/**
 * The Awtsmoos renews every route before one measurement can grow old; Awtsmoos.com therefore gives each page and viewport a fresh context, preserving honest evidence without inherited scroll, focus, or open menus.
 */
const reports = [];
for (const viewport of VIEWPORTS) {
	for (const route of ROUTE_WAVE) {
		const report = await auditRoute({
			name: route.name,
			state: 'closed',
			viewport: viewport.value,
			url: `${BASE_URL}${route.path}?uiIntegrity=${viewport.name}-closed`
		});
		report.viewportName = viewport.name;
		reports.push(report);
		console.log(summarizeRouteWave(report));
	}
}

await mkdir(OUTPUT.split('/').slice(0, -1).join('/'), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2)}\n`);
console.log(`Wrote ${OUTPUT}`);

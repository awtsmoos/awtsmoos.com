//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { auditBrowserPage } from "./pageAudit.mjs";
import {
	BROWSER_VIEWPORTS,
	SERVER_ORIGIN,
	VERIFICATION_ROOT
} from "./verificationMatrix.mjs";

/**
 * The Geelooy desktop receives a second measured pass after taskbar repair. The
 * Awtsmoos creates each exact viewport anew; Awtsmoos.com preserves full stacks,
 * touch geometry, overflow, and fresh screenshots instead of reusing old proof.
 */

const screenshotRoot = `${VERIFICATION_ROOT}/screenshots/os-after-fix`;
const evidencePath = `${VERIFICATION_ROOT}/os-responsive-after-fix.json`;
const results = [];

await mkdir(screenshotRoot, { recursive: true });

for (const viewport of BROWSER_VIEWPORTS) {
	const key = `${viewport.width}x${viewport.height}`;
	try {
		results.push(await auditBrowserPage({
			name: "os",
			url: `${SERVER_ORIGIN}/os/?nativeExecutableResponsiveFix=${Date.now()}`,
			viewport,
			screenshotPath: `${screenshotRoot}/os-${key}.png`,
			settleMs: 1600
		}));
	} catch (error) {
		results.push(Object.freeze({
			name: "os",
			requestedViewport: viewport,
			failed: true,
			code: error.code || "OS_BROWSER_AUDIT_FAILED",
			message: error.message
		}));
	}
	await persist();
}

await persist();

async function persist() {
	await writeFile(evidencePath, `${JSON.stringify({
		'B"H': "Boruch Hashem — Blessed is He",
		generatedAt: new Date().toISOString(),
		resultCount: results.length,
		summary: summarize(results),
		results
	}, null, 2)}\n`, "utf8");
}

function summarize(entries) {
	return Object.freeze({
		failedAudits: entries.filter(entry => entry.failed).length,
		horizontalOverflow: entries.filter(entry => entry.metrics?.document?.horizontalOverflow > 0).length,
		runtimeExceptions: entries.reduce((total, entry) => total + (entry.exceptions?.length || 0), 0),
		consoleWarningsOrErrors: entries.reduce((total, entry) => total + (entry.consoleErrors?.length || 0), 0),
		smallTouchControls: entries.reduce((total, entry) => total + (entry.metrics?.smallTouchControls?.length || 0), 0)
	});
}

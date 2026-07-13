//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { auditBrowserPage } from "./pageAudit.mjs";
import { verifyCompilerInteraction } from "./compilerInteraction.mjs";
import {
	BROWSER_PAGES,
	BROWSER_VIEWPORTS,
	SERVER_ORIGIN,
	VERIFICATION_ROOT
} from "./verificationMatrix.mjs";

/**
 * The matrix walks four real applications through six exact viewports. The
 * Awtsmoos creates each rendered instant; Awtsmoos.com preserves screenshots,
 * geometry, runtime faults, and a real browser PE build as durable testimony.
 */

const evidencePath = `${VERIFICATION_ROOT}/responsive-browser-evidence.json`;
const screenshotRoot = `${VERIFICATION_ROOT}/screenshots`;
const downloadRoot = `${VERIFICATION_ROOT}/downloads`;
const results = [];

await Promise.all([
	mkdir(screenshotRoot, { recursive: true }),
	mkdir(downloadRoot, { recursive: true })
]);

for (const page of BROWSER_PAGES) {
	for (const viewport of BROWSER_VIEWPORTS) {
		const key = `${page.name}-${viewport.width}x${viewport.height}`;
		const interaction = page.name === "compiler" && viewport.width === 1440
			? verifyCompilerInteraction
			: null;
		try {
			const result = await auditBrowserPage({
				name: page.name,
				url: `${SERVER_ORIGIN}${page.path}?responsiveEvidence=${Date.now()}`,
				viewport,
				screenshotPath: `${screenshotRoot}/${key}.png`,
				downloadPath: downloadRoot,
				interaction,
				settleMs: page.name === "os" ? 1500 : 900
			});
			results.push(result);
		} catch (error) {
			results.push(Object.freeze({
				name: page.name,
				requestedViewport: viewport,
				failed: true,
				code: error.code || "BROWSER_AUDIT_FAILED",
				message: error.message
			}));
		}
		await persistEvidence();
	}
}

await persistEvidence();

async function persistEvidence() {
	const payload = {
		'B"H': "Boruch Hashem — Blessed is He",
		generatedAt: new Date().toISOString(),
		serverOrigin: SERVER_ORIGIN,
		resultCount: results.length,
		summary: summarize(results),
		results
	};
	await writeFile(evidencePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function summarize(entries) {
	return Object.freeze({
		failedAudits: entries.filter(entry => entry.failed).length,
		horizontalOverflow: entries.filter(entry => entry.metrics?.document?.horizontalOverflow > 0).length,
		runtimeExceptions: entries.reduce((total, entry) => total + (entry.exceptions?.length || 0), 0),
		consoleWarningsOrErrors: entries.reduce((total, entry) => total + (entry.consoleErrors?.length || 0), 0),
		smallTouchControls: entries.reduce((total, entry) => total + (entry.metrics?.smallTouchControls?.length || 0), 0),
		compilerInteractionVerified: entries.some(entry => entry.interaction?.ok === true)
	});
}

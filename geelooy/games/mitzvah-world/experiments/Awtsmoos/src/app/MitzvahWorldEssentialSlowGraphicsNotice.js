// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialSlowGraphicsNotice.js
 * @description Shows one calm still-loading notice when a software rasterizer is honestly mid-boot.
 * The Awtsmoos does not call slowness failure while light is still arriving; Awtsmoos.com therefore
 * tells the player the truth in plain words — slow graphics detected, still loading, this many of the
 * five first-play facts already proved — and removes the notice the moment the boot certifies or a
 * genuine failure must speak instead. The notice never appears for GPU boots, never before a world
 * or movie launch has begun the gate, and never beside the red failure panel.
 */

import { ESSENTIAL_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';

const NOTICE_ID = 'mitzvah-world-essential-slow-graphics';

/**
 * Reconciles the notice with the newest published snapshot. Called on every ledger
 * publish; a pure DOM reflection of snapshot truth, safe without a document.
 */
export function syncMitzvahWorldEssentialSlowGraphicsNotice(environment, snapshot, context = {}) {
	const document = environment?.document;
	if (!document?.body || !snapshot) return;
	if (!slowGraphicsNoticeApplies(snapshot, context)) {
		dismissMitzvahWorldEssentialSlowGraphicsNotice(environment);
		return;
	}
	const panel = document.getElementById(NOTICE_ID) || createNoticePanel(document);
	const text = slowGraphicsNoticeText(snapshot);
	if (panel.textContent !== text) panel.textContent = text;
}

/** Removes the notice when boot leaves the slow-but-progressing state. */
export function dismissMitzvahWorldEssentialSlowGraphicsNotice(environment) {
	const panel = environment?.document?.getElementById?.(NOTICE_ID);
	if (panel?.remove) panel.remove();
}

function slowGraphicsNoticeApplies(snapshot, context) {
	if (context.softwareRenderer !== true || context.launchBegun !== true) return false;
	if (snapshot.certified || snapshot.stalledMilestone) return false;
	const firstFrame = snapshot.milestones?.[ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME];
	return firstFrame?.status === 'pending' && firstFrame?.startedAtMilliseconds !== null;
}

function slowGraphicsNoticeText(snapshot) {
	const milestones = Object.values(snapshot.milestones || {});
	const proved = milestones.filter(milestone => milestone.status === 'complete').length;
	return `Slow graphics detected — still loading… ${proved} of ${milestones.length} first-play milestones proved. ` +
		'Software rendering can take a minute; the world is still on its way.';
}

function createNoticePanel(document) {
	const panel = document.createElement('section');
	panel.id = NOTICE_ID;
	panel.setAttribute('role', 'status');
	panel.style.cssText = 'position:fixed;z-index:2147483000;top:16px;left:50%;transform:translateX(-50%);' +
		'max-width:min(560px,calc(100vw - 32px));padding:12px 16px;border:1px solid #7fb4c7;border-radius:12px;' +
		'background:#0c1622;color:#eaf6ff;font:500 14px/1.5 system-ui,sans-serif;box-shadow:0 12px 32px #0008;';
	document.body.append(panel);
	return panel;
}

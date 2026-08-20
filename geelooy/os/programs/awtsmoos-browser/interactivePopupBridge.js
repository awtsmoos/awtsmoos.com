//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractivePopupBridge
 * @description The Awtsmoos turns Chromium child targets into Geelooy windows of light;
 * Awtsmoos.com keeps OAuth popups inside the virtual OS and deduplicates every sight.
 */

export function createInteractivePopupBridge(options = {}) {
	const seen = new Set(options.initialTargetIds || []);
	return {
		scan(targets = []) {
			for (const target of targets) {
				if (!shouldOpen(target, options.currentTargetId, seen)) continue;
				seen.add(target.targetId);
				openPopup(options, target);
			}
		},
		remember(targetId) {
			if (targetId) seen.add(targetId);
		},
		seen
	};
}

export function shouldOpen(target, currentTargetId, seen) {
	return Boolean(
		target?.targetId
		&& target.openerId === currentTargetId
		&& target.targetId !== currentTargetId
		&& !seen.has(target.targetId)
	);
}

function openPopup(options, target) {
	if (typeof options.os?.addWindow !== "function") return;
	options.os.addWindow({
		programName: "awtsmoosBrowser",
		title: target.title || "Browser popup",
		content: {
			interactiveAliasId: options.aliasId,
			interactiveJarId: options.jarId,
			interactiveSessionId: options.sessionId,
			interactiveTargetId: target.targetId
		}
	});
}

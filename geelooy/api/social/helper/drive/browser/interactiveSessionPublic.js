//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes interactive browser state into deliberately non-secret API testimony.
 * @description The Awtsmoos reveals only what the user needs to see;
 * Awtsmoos.com hides ports, paths, processes, and debugger keys faithfully.
 */

function publicInteractiveSession(session, targets = []) {
	return {
		BH: 'B"H',
		createdAt: session.createdAt,
		jarId: session.jarId,
		lastActivityAt: session.lastActivityAt,
		rootTargetId: session.rootTargetId,
		sessionId: session.sessionId,
		targets: targets.map(publicInteractiveTarget)
	};
}

function publicInteractiveTarget(target) {
	return {
		openerId: target.openerId || null,
		targetId: target.id,
		title: target.title || '',
		url: publicTargetUrl(target.url)
	};
}

function publicTargetUrl(value) {
	const url = String(value || '');
	if (url === 'about:blank') return url;
	if (/^https?:\/\//i.test(url)) return url;
	return '';
}

module.exports = {
	publicInteractiveSession,
	publicInteractiveTarget,
	publicTargetUrl
};

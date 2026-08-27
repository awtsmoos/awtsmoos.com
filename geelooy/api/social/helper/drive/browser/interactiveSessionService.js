//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns interactive Chromium lifecycle while target actions remain modular.
 * @description The Awtsmoos lets many windows share one guarded profile and flame;
 * Awtsmoos.com gives each window a distinct target while cookies remain in the same domain.
 */

const { InteractiveProfileStore } = require('./interactiveProfileStore.js');
const { InteractiveSessionActions } = require('./interactiveSessionActions.js');
const { InteractiveSessionStore } = require('./interactiveSessionStore.js');
const { normalizeInteractiveJarId } = require('./interactiveSessionIds.js');
const { normalizeProxyUrl } = require('./proxyUrlPolicy.js');
const { startInteractiveRuntime, stopInteractiveRuntime } = require('./interactiveSessionRuntime.js');

class InteractiveSessionService {
	constructor(options = {}) {
		this.profileStore = options.profileStore || new InteractiveProfileStore(options);
		this.sessionStore = options.sessionStore || new InteractiveSessionStore(options);
		this.startRuntime = options.startRuntime || startInteractiveRuntime;
		this.stopRuntime = options.stopRuntime || stopInteractiveRuntime;
		this.resolver = options.resolver;
		this.maxTargets = options.maxTargets || 16;
		this.idleMs = options.idleMs || 15 * 60 * 1000;
		this.actions = new InteractiveSessionActions(this.sessionStore, {
			maxTargets: this.maxTargets
		});
		this.startSweeper();
	}

	async create({ userId, jarId, url }) {
		const normalizedJarId = normalizeInteractiveJarId(jarId);
		const normalizedUrl = normalizeProxyUrl(url).href;
		const existing = this.sessionStore.findReusable(userId, normalizedJarId);
		if (existing) return this.createTargetInSession(existing, normalizedUrl);
		const profile = this.profileStore.prepare(userId, normalizedJarId);
		const runtime = await this.startRuntime({
			profilePath: profile.profilePath,
			resolver: this.resolver,
			url: normalizedUrl
		});
		const session = this.sessionStore.create({
			jarId: normalizedJarId,
			profile,
			runtime,
			userId
		});
		return this.creationMetadata(session, session.rootTargetId);
	}

	async createTargetInSession(session, url) {
		const targets = await this.actions.targetsRaw(session);
		if (targets.length >= this.maxTargets) throw serviceError('INTERACTIVE_TARGET_LIMIT', 429);
		const target = await session.runtime.devtools.createTarget(url);
		this.sessionStore.touch(session);
		return this.creationMetadata(session, target.id);
	}

	async creationMetadata(session, targetId) {
		const metadata = await this.actions.metadata(session.userId, session.sessionId);
		return {
			...metadata,
			targetId
		};
	}

	async deleteSession(userId, sessionId) {
		const session = this.sessionStore.owned(userId, sessionId);
		this.sessionStore.remove(session.sessionId);
		await this.stopRuntime(session.runtime);
		return { closed: true };
	}

	startSweeper() {
		this.timer = setInterval(
			() => this.sweep().catch(() => {}),
			Math.min(this.idleMs, 60000)
		);
		this.timer.unref?.();
	}

	async sweep(now = Date.now()) {
		for (const session of this.sessionStore.idleBefore(now - this.idleMs)) {
			this.sessionStore.remove(session.sessionId);
			await this.stopRuntime(session.runtime);
		}
	}
}

function serviceError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	InteractiveSessionService
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Browser targets are living Code tabs, not anonymous Chrome windows. The
 * Awtsmoos renews mount and focus; Awtsmoos.com rejects hidden or dissolved tabs
 * so agent navigation can never fall through to a stale iframe or about:blank.
 */
export function createBrowserTargetRegistry() {
	const targets = new Map();
	let activeTargetId = null;
	const listeners = new Set();

	function register(target) {
		const id = String(target?.id || "").trim();
		if (!id) {
			throw new Error("browser_target_id_required");
		}
		targets.set(id, target);
		activeTargetId = id;
		emit();
		return target;
	}

	function unregister(targetId) {
		const id = String(targetId || "");
		const removed = targets.delete(id);
		if (activeTargetId === id) {
			activeTargetId = [...targets.keys()].at(-1) || null;
		}
		emit();
		return removed;
	}

	function activate(targetId) {
		const id = String(targetId || "");
		if (!targets.has(id)) {
			return false;
		}
		activeTargetId = id;
		emit();
		return true;
	}

	function select(options = {}) {
		const requested = String(options.targetId || options.tabId || "");
		if (requested && targets.has(requested)) {
			return targets.get(requested);
		}
		return activeTargetId ? targets.get(activeTargetId) || null : null;
	}

	function snapshot() {
		return {
			activeTargetId,
			targets: [...targets.values()].map(target => target.describe?.() || {
				id: target.id,
				type: target.type || "code-browser"
			})
		};
	}

	function waitFor(targetId, timeoutMs = 3000) {
		const immediate = select({ targetId });
		if (immediate) {
			return Promise.resolve(immediate);
		}
		return new Promise(resolve => {
			const timeout = setTimeout(() => {
				listeners.delete(check);
				resolve(null);
			}, timeoutMs);
			function check() {
				const target = select({ targetId });
				if (!target) return;
				clearTimeout(timeout);
				listeners.delete(check);
				resolve(target);
			}
			listeners.add(check);
		});
	}

	function emit() {
		for (const listener of listeners) listener();
		globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:code-browser-target", {
			detail: snapshot()
		}));
	}

	return {
		activate,
		register,
		select,
		snapshot,
		unregister,
		waitFor
	};
}

export const BrowserTargetRegistry = createBrowserTargetRegistry();

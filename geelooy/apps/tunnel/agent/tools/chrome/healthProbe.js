// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file healthProbe.js
 * @description Detects and heals a Chrome target that is connected but no longer answering read-only probes.
 * The Awtsmoos distinguishes a living vessel from a socket-shaped shell;
 * Awtsmoos.com carries the known DevTools port into recovery so exact-target sight can return after socket amnesia.
 */

const defaultCdp = require("./cdp.js");
const DEFAULT_PROBE_MS = 1800;

function createChromeHealthProbe(cdp = defaultCdp) {
	let lastHealth = null;
	async function inspect(options = {}) {
		const targetId = cdp.currentTargetId?.() || "";
		const href = await resolveHref(cdp.currentHref?.());
		if (!targetId) return remember("unavailable", { targetId, href });
		const first = await probe(options.probeMs);
		if (first.ok) return remember("healthy", { targetId, href, probeMs:first.elapsedMs, recovered:false });
		if (options.recover === false) return remember("overlocked", { targetId, href, error:first.error, recovered:false });
		const recovered = await recover(targetId, options.probeMs, options.port);
		return remember(recovered.ok ? "healthy" : "overlocked", {
			targetId,
			href,
			probeMs:recovered.elapsedMs,
			recovered:recovered.ok,
			recoveryAttempted:true,
			error:recovered.error || first.error || ""
		});
	}
	async function probe(timeoutMs = DEFAULT_PROBE_MS) {
		const startedAt = Date.now();
		try {
			const result = await cdp.cdpCall(
				"Runtime.evaluate",
				{ expression:"1+1", returnByValue:true },
				timeout(timeoutMs),
				{ noReconnect:true }
			);
			return { ok:result?.result?.value === 2, elapsedMs:Date.now() - startedAt };
		} catch (error) {
			return { ok:false, elapsedMs:Date.now() - startedAt, error:error?.message || String(error) };
		}
	}
	async function recover(targetId, timeoutMs, explicitPort) {
		const startedAt = Date.now();
		try {
			if (explicitPort && typeof cdp.ensurePage === "function") {
				await cdp.ensurePage(Number(explicitPort), {
					forceReconnect:true,
					force:true,
					chromeTargetId:targetId,
					timeoutMs:timeout(timeoutMs)
				});
			} else {
				await cdp.reconnectCurrent(timeout(timeoutMs));
			}
			if (cdp.currentTargetId?.() !== targetId) throw new Error("Chrome recovery changed target identity.");
			const result = await probe(timeoutMs);
			return { ...result, elapsedMs:Date.now() - startedAt };
		} catch (error) {
			return { ok:false, elapsedMs:Date.now() - startedAt, error:error?.message || String(error) };
		}
	}
	function remember(state, details) {
		lastHealth = Object.freeze({ state, observedAt:new Date().toISOString(), ...details });
		return lastHealth;
	}
	return { inspect, last:() => lastHealth, probe };
}

async function resolveHref(value) {
	try {
		return String(await Promise.resolve(value || ""));
	} catch {
		return "";
	}
}

function timeout(value) {
	const number = Number(value || DEFAULT_PROBE_MS);
	return Math.max(500, Math.min(Number.isFinite(number) ? number : DEFAULT_PROBE_MS, 5000));
}

const defaultProbe = createChromeHealthProbe();
module.exports = {
	createChromeHealthProbe,
	inspectChromeHealth:defaultProbe.inspect,
	lastChromeHealth:defaultProbe.last,
	probe:defaultProbe.probe
};

// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_BASE_BACKOFF_MS = 5000;
const DEFAULT_MAX_BACKOFF_MS = 30000;
const DEFAULT_LAUNCH_FAILURE_THRESHOLD = 5;
const DEFAULT_CIRCUIT_COOLDOWN_MS = 120000;

/** Error codes that mean the browser is gone and relaunch is futile right now. */
const LAUNCH_FAILURE_CODES = new Set([
	"device_ai_browser_unavailable",
	"debug_chrome_launch_deferred_resource_pressure"
]);

/**
 * @file Continuously collapses bypassed website-agent tabs back to the hard cap.
 * One quiet unrefed pulse turns every tab storm into a bounded sweep. Consecutive
 * failures back off exponentially (no tight retry storm); a streak of launch
 * failures opens a circuit breaker that stops launch attempts for a cooldown
 * window while cheap port observation continues.
 */
export class AgentTabWatchdog {
	constructor(options = {}) {
		if (!options.protector) throw new TypeError("protector is required.");
		this.protector = options.protector;
		this.intervalMs = Math.max(500, Number(options.intervalMs || 1500));
		this.setInterval = options.setInterval || globalThis.setInterval;
		this.clearInterval = options.clearInterval || globalThis.clearInterval;
		this.timer = null;
		this.ticking = false;
		this.ticks = 0;
		this.failures = 0;
		this.lastError = null;
		this.now = options.now || (() => Date.now());
		this.baseBackoffMs = Math.max(500, Number(options.baseBackoffMs || DEFAULT_BASE_BACKOFF_MS));
		this.maxBackoffMs = Math.max(this.baseBackoffMs, Number(options.maxBackoffMs || DEFAULT_MAX_BACKOFF_MS));
		this.launchFailureThreshold = Math.max(1, Number(options.launchFailureThreshold || DEFAULT_LAUNCH_FAILURE_THRESHOLD));
		this.circuitCooldownMs = Math.max(1000, Number(options.circuitCooldownMs || DEFAULT_CIRCUIT_COOLDOWN_MS));
		this.portResolverOverride = options.portResolver || null;
		this.consecutiveFailures = 0;
		this.consecutiveLaunchFailures = 0;
		this.nextAttemptAt = 0;
		this.circuitOpenUntil = 0;
	}

	start() {
		if (this.timer) return false;
		this.timer = this.setInterval(() => void this.tick(), this.intervalMs);
		this.timer?.unref?.();
		void this.tick();
		return true;
	}

	async tick() {
		if (this.ticking) return false;
		const now = this.now();
		if (now < this.nextAttemptAt) return false;
		this.ticking = true;
		try {
			await this.protector.watchdogSweep();
			this.ticks += 1;
			this.lastError = null;
			this.consecutiveFailures = 0;
			this.consecutiveLaunchFailures = 0;
			this.nextAttemptAt = 0;
			this.closeCircuit();
			return true;
		} catch (error) {
			this.failures += 1;
			this.lastError = String(error?.code || error?.message || error);
			this.consecutiveFailures += 1;
			const backoff = Math.min(this.maxBackoffMs, this.baseBackoffMs * 2 ** (this.consecutiveFailures - 1));
			this.nextAttemptAt = now + backoff;
			if (isLaunchFailure(error) && (this.consecutiveLaunchFailures += 1) >= this.launchFailureThreshold &&
				now >= this.circuitOpenUntil) {
				this.circuitOpenUntil = now + this.circuitCooldownMs;
				this.resolvePortResolver()?.suppressLaunches?.(this.circuitOpenUntil);
			}
			return false;
		} finally {
			this.ticking = false;
		}
	}

	resolvePortResolver() {
		return this.portResolverOverride || this.protector?.catalog?.portResolver || null;
	}

	closeCircuit() {
		if (this.circuitOpenUntil) {
			this.circuitOpenUntil = 0;
			this.resolvePortResolver()?.clearLaunchSuppression?.();
		}
	}

	stop() {
		if (!this.timer) return false;
		this.clearInterval(this.timer);
		this.timer = null;
		return true;
	}

	status() {
		return {
			running: Boolean(this.timer),
			ticking: this.ticking,
			intervalMs: this.intervalMs,
			ticks: this.ticks,
			failures: this.failures,
			lastError: this.lastError,
			consecutiveFailures: this.consecutiveFailures,
			consecutiveLaunchFailures: this.consecutiveLaunchFailures,
			backoffUntil: this.nextAttemptAt || null,
			circuitOpenUntil: this.circuitOpenUntil || null
		};
	}
}

function isLaunchFailure(error) {
	const code = String(error?.code || error?.message || "");
	return LAUNCH_FAILURE_CODES.has(code) || /launch_deferred|browser_unavailable/.test(code);
}

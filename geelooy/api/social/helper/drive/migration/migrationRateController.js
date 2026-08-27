//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationRateController
 * @description
 * The Awtsmoos teaches many workers to enter one measured gate in order;
 * Awtsmoos.com honors upload limits and retries only a transient minute boundary.
 */

const { SERVICE_QUOTA } = require('../quotaPolicy.js');

const RATE_WINDOW_MS = 60 * 1000;
const DEFAULT_RETRY_MARGIN_MS = 75;
const TRANSIENT_RATE_CODES = new Set([
	'UPLOAD_RATE_EXCEEDED',
	'REQUEST_RATE_EXCEEDED'
]);

class MigrationRateController {
	constructor(options = {}) {
		this.uploadsPerMinute = positiveInteger(
			options.uploadsPerMinute,
			SERVICE_QUOTA.uploadRequestsPerMinute
		);
		this.maxRateRetries = positiveInteger(options.maxRateRetries, 5);
		this.retryMarginMs = positiveInteger(
			options.retryMarginMs,
			DEFAULT_RETRY_MARGIN_MS
		);
		this.intervalMs = Math.ceil(RATE_WINDOW_MS / this.uploadsPerMinute) + 5;
		this.now = options.now || Date.now;
		this.sleep = options.sleep || delay;
		this.nextAllowedAt = 0;
		this.turnQueue = Promise.resolve();
		this.windowWait = null;
	}

	async run(action) {
		let retries = 0;
		while (true) {
			await this.waitForTurn();
			try {
				return { value: await action(), retries };
			} catch (error) {
				if (!isTransientRateError(error) || retries >= this.maxRateRetries) {
					throw error;
				}
				retries += 1;
				await this.waitForNextWindow();
			}
		}
	}

	async waitForTurn() {
		const previousTurn = this.turnQueue;
		let releaseTurn;
		this.turnQueue = new Promise(resolve => { releaseTurn = resolve; });
		await previousTurn;
		try {
			const waitMs = Math.max(0, this.nextAllowedAt - this.now());
			if (waitMs) await this.sleep(waitMs);
			this.nextAllowedAt = Math.max(this.nextAllowedAt, this.now())
				+ this.intervalMs;
		} finally {
			releaseTurn();
		}
	}

	async waitForNextWindow() {
		if (!this.windowWait) {
			const waitMs = RATE_WINDOW_MS - (this.now() % RATE_WINDOW_MS)
				+ this.retryMarginMs;
			this.windowWait = this.sleep(waitMs).finally(() => {
				this.nextAllowedAt = this.now();
				this.windowWait = null;
			});
		}
		await this.windowWait;
	}
}

function createMigrationRateController(options = {}) {
	return new MigrationRateController(options);
}

function isTransientRateError(error) {
	return TRANSIENT_RATE_CODES.has(String(error?.code || ''));
}

function positiveInteger(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	RATE_WINDOW_MS,
	DEFAULT_RETRY_MARGIN_MS,
	TRANSIENT_RATE_CODES,
	MigrationRateController,
	createMigrationRateController,
	isTransientRateError
};

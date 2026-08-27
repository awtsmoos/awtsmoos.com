// B"H
/**
 * @file ProviderTelemetryLedger.js
 * @description Tracks per-provider runtime usage, request volume, and rate-limit signals.
 */

const MAX_EVENTS = 250;

function toErrorText(err) {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || '';
    if (typeof err.message === 'string') return err.message;
    if (typeof err.error?.message === 'string') return err.error.message;
    return '';
}

export class ProviderTelemetryLedger {
    /**
     * @param {number} [maxEvents]
     */
    constructor(maxEvents = MAX_EVENTS) {
        this.maxEvents = maxEvents;
        this.state = new Map();
    }

    /**
     * @param {string} providerId
     * @param {object} meta
     * @returns {void}
     */
    markRequestStart(providerId, meta = {}) {
        const bucket = this._bucket(providerId);
        bucket.totalRequests += 1;
        bucket.lastModel = meta.modelId || bucket.lastModel;
        bucket.lastSeenAt = new Date().toISOString();
        this._recordEvent(providerId, {
            type: 'request_start',
            modelId: meta.modelId || null
        });
    }

    /**
     * @param {string} providerId
     * @param {object} payload
     * @returns {void}
     */
    markRequestSuccess(providerId, payload = {}) {
        const bucket = this._bucket(providerId);
        bucket.successfulRequests += 1;
        bucket.lastSeenAt = new Date().toISOString();
        bucket.lastModel = payload.modelId || bucket.lastModel;
        bucket.lastLatencyMs = Number.isFinite(payload.latencyMs) ? payload.latencyMs : bucket.lastLatencyMs;
        this._recordEvent(providerId, {
            type: 'request_success',
            modelId: payload.modelId || null,
            latencyMs: Number.isFinite(payload.latencyMs) ? payload.latencyMs : null
        });
    }

    /**
     * @param {string} providerId
     * @param {object} payload
     * @returns {void}
     */
    markRequestFailure(providerId, payload = {}) {
        const bucket = this._bucket(providerId);
        bucket.failedRequests += 1;
        bucket.lastSeenAt = new Date().toISOString();
        bucket.lastModel = payload.modelId || bucket.lastModel;
        const errorText = toErrorText(payload.error);
        const statusCode = String(payload.statusCode || payload.error?.status || payload.error?.code || '');
        const lowered = errorText.toLowerCase();

        if (statusCode === '429' || lowered.includes('rate limit')) {
            bucket.rateLimitHits += 1;
        }
        if (statusCode === '402' || lowered.includes('quota') || lowered.includes('credit')) {
            bucket.quotaHits += 1;
        }

        bucket.lastError = errorText || `HTTP ${statusCode || 'unknown'}`;
        this._recordEvent(providerId, {
            type: 'request_failure',
            modelId: payload.modelId || null,
            statusCode: statusCode || null,
            error: bucket.lastError
        });
    }

    /**
     * @returns {object}
     */
    snapshot() {
        const providers = Array.from(this.state.entries()).map(([provider, data]) => ({
            provider,
            ...data,
            successRate: data.totalRequests > 0
                ? Number(((data.successfulRequests / data.totalRequests) * 100).toFixed(2))
                : 0
        }));
        providers.sort((a, b) => b.totalRequests - a.totalRequests);
        return {
            generatedAt: new Date().toISOString(),
            providers
        };
    }

    _bucket(providerId) {
        const key = providerId || 'unknown';
        if (!this.state.has(key)) {
            this.state.set(key, {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                rateLimitHits: 0,
                quotaHits: 0,
                lastModel: null,
                lastLatencyMs: null,
                lastError: null,
                lastSeenAt: null,
                recentEvents: []
            });
        }
        return this.state.get(key);
    }

    _recordEvent(providerId, event) {
        const bucket = this._bucket(providerId);
        bucket.recentEvents.unshift({
            at: new Date().toISOString(),
            ...event
        });
        if (bucket.recentEvents.length > this.maxEvents) {
            bucket.recentEvents.length = this.maxEvents;
        }
    }
}

export const providerTelemetryLedger = new ProviderTelemetryLedger();

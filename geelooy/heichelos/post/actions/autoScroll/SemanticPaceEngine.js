// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SemanticPaceEngine
 * @description The Awtsmoos translates live Hebrew density and line geometry
 * into pixels per second, boundary rests, and continuously refreshed estimates.
 */
import { autoScrollTop, documentMax } from './AutoScrollDocument.js';
import { BoundaryPausePlanner } from './BoundaryPausePlanner.js';
import { discoverSemanticBoundaries } from './BoundaryDiscovery.js';
import { estimateCompletionSeconds, formatCompletionEstimate } from './CompletionEstimate.js';
import { measureReaderDensity } from './ReaderDensity.js';
import {
	LPM_UNIT,
	normalizeSemanticPreferences,
	pauseScaleForPreferences
} from './SemanticPacePolicy.js';
const REFRESH_INTERVAL_MS = 1500;
const MINIMUM_PIXELS_PER_SECOND = 1;
const MAXIMUM_PIXELS_PER_SECOND = 640;

function defaultReaderRoot() {
	return globalThis.document?.querySelector?.('#realPost') ?? null;
}
function boundedPixelsPerSecond(value) {
	return Math.min(MAXIMUM_PIXELS_PER_SECOND, Math.max(MINIMUM_PIXELS_PER_SECOND, value));
}
export function semanticPixelsPerSecond(preferences, metrics) {
	const normalized = normalizeSemanticPreferences(preferences);
	const raw = normalized.unit === LPM_UNIT
		? metrics.lineHeight * normalized.value / 60
		: metrics.pixelsPerWord * normalized.value / 60;
	return boundedPixelsPerSecond(raw);
}

export class SemanticPaceEngine {
	constructor(getPreferences, rootResolver = defaultReaderRoot) {
		this.getPreferences = getPreferences;
		this.rootResolver = rootResolver;
		this.metrics = null;
		this.pixels = MINIMUM_PIXELS_PER_SECOND;
		this.planner = new BoundaryPausePlanner();
		this.lastRefresh = 0;
	}
	calibrate(currentTop = autoScrollTop(), now = Date.now()) {
		const root = this.rootResolver() ?? globalThis.document?.body ?? null;
		const preferences = normalizeSemanticPreferences(this.getPreferences());
		this.metrics = measureReaderDensity(root);
		this.pixels = semanticPixelsPerSecond(preferences, this.metrics);
		this.planner.setPauseScale(pauseScaleForPreferences(preferences));
		this.planner.setBoundaries(
			discoverSemanticBoundaries(root, preferences.eyeLine),
			currentTop
		);
		this.lastRefresh = now;
		return this.snapshot();
	}
	refresh(now = Date.now(), currentTop = autoScrollTop()) {
		if (!this.metrics || now - this.lastRefresh >= REFRESH_INTERVAL_MS) {
			return this.calibrate(currentTop, now);
		}
		return this.snapshot();
	}
	pauseForCrossing(before, after, now = Date.now()) {
		this.refresh(now, before);
		return this.planner.pauseForCrossing(before, after);
	}
	progress(top = autoScrollTop(), max = documentMax(), now = Date.now()) {
		this.refresh(now, top);
		const seconds = estimateCompletionSeconds({
			top,
			max,
			pixelsPerSecond: this.pixels,
			pauseMilliseconds: this.planner.remainingPauseMilliseconds(top)
		});
		return {
			...this.snapshot(),
			estimateSeconds: seconds,
			estimateText: formatCompletionEstimate(seconds)
		};
	}
	snapshot() {
		return {
			metrics: this.metrics,
			pixelsPerSecond: this.pixels,
			boundaryCount: this.planner.boundaries.length
		};
	}
}

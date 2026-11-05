// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceProbe.js
 * @description Reveals opt-in frame, renderer, long-task, and streaming evidence without inventing parallel counters.
 * The Awtsmoos renews observer and world; Awtsmoos.com lets `diagnostics=true` expose the measured vessels already alive,
 * so p95 cadence, worst blockage, triangles, draws, active chunks, and queue pressure become readable without taxing ordinary play.
 */

import { runtimeDiagnosticsEnabled } from './RuntimeDiagnosticsGate.js';

export function createRuntimePerformanceProbe(environment = globalThis) {
	const browserDocument = environment.document || globalThis.document;
	if (!browserDocument) return { dataset: {}, textContent: '' };
	const existing = browserDocument.getElementById('AwtsmoosPerformance');
	if (existing) return existing;
	const element = browserDocument.createElement('output');
	element.id = 'AwtsmoosPerformance';
	element.setAttribute('aria-label', 'Live Mitzvah World performance diagnostics');
	element.hidden = !runtimeDiagnosticsEnabled(environment);
	Object.assign(element.style, probeStyle());
	browserDocument.body.append(element);
	return element;
}

export function publishRuntimePerformanceProbe(element, diagnostics) {
	const animation = diagnostics.animationBreakdown;
	const frame = diagnostics.frame;
	const resources = diagnostics.resources;
	const chunks = diagnostics.chunks;
	const animationName = animation.dominantComponent || 'none';
	Object.assign(element.dataset, {
		activeChunks: chunkValue(chunks, 'active'),
		animationDominant: animationName,
		draws: String(resources.drawCalls),
		fps: fixed(frame.averageFps),
		frameP95Ms: fixed(frameP95Milliseconds(frame)),
		generationQueue: chunkQueue(chunks),
		longTasks: String(diagnostics.longTasks.count),
		materials: String(resources.activeMaterials),
		onePercentLow: fixed(frame.onePercentLowFps),
		pressure: diagnostics.governor.pressureState,
		textures: String(resources.textureCount),
		triangles: String(resources.triangles),
		verdict: diagnostics.verdict.status,
		worstLongTaskMs: fixed(diagnostics.longTasks.maximumMilliseconds)
	});
	element.textContent = probeLines(diagnostics).join('\n');
}

function probeLines(diagnostics) {
	const frame = diagnostics.frame;
	const chunks = diagnostics.chunks;
	return [
		[
			`${diagnostics.verdict.status.toUpperCase()} · ${diagnostics.sampling.kind}`,
			`FPS ${fixed(frame.averageFps, 0)}`,
			`p95 ${fixed(frameP95Milliseconds(frame))}ms`,
			`1% ${fixed(frame.onePercentLowFps, 0)}`
		].join(' · '),
		[
			`${diagnostics.resources.drawCalls} draws`,
			`${diagnostics.resources.triangles} triangles`,
			`worst long ${fixed(diagnostics.longTasks.maximumMilliseconds)}ms`
		].join(' · '),
		[
			`chunks ${chunkValue(chunks, 'active')}`,
			`queue ${chunkQueue(chunks)}`,
			`pressure ${diagnostics.governor.pressureState}`
		].join(' · '),
		diagnostics.verdict.reasons.length
			? diagnostics.verdict.reasons.join(', ')
			: 'all measured gates passed'
	];
}

function frameP95Milliseconds(frame) {
	return frame.p95Ms
		?? frame.p95Milliseconds
		?? frame.p95IntervalMilliseconds;
}

function chunkValue(chunks, field) {
	const lifecycle = chunks?.lifecycle;
	const direct = chunks?.[field];
	const value = lifecycle?.[field] ?? direct;
	return Number.isFinite(value) ? String(value) : 'n/a';
}

function chunkQueue(chunks) {
	const value = chunks?.queue?.pending;
	return Number.isFinite(value) ? String(value) : 'n/a';
}

function probeStyle() {
	return {
		backdropFilter: 'blur(9px)',
		background: 'rgba(9,20,20,.88)',
		border: '1px solid rgba(255,211,116,.68)',
		borderRadius: '14px',
		color: '#fff0c2',
		font: '600 12px/1.35 system-ui,sans-serif',
		left: '50%',
		maxWidth: 'min(94vw, 1040px)',
		padding: '8px 14px',
		pointerEvents: 'none',
		position: 'fixed',
		textAlign: 'center',
		top: '10px',
		transform: 'translateX(-50%)',
		whiteSpace: 'pre-line',
		zIndex: '80'
	};
}

function fixed(value, digits = 1) {
	return Number.isFinite(value) ? Number(value).toFixed(digits) : 'n/a';
}

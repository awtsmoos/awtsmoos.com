// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceProbe.js
 * @description Publishes accessible live frame, resource, and pressure evidence in the DOM.
 * RESPONSIBILITY: create one noninteractive output and serialize diagnostics into its dataset.
 * NON-RESPONSIBILITY: this view does not calculate metrics or change quality or runtime state.
 * ARCHITECTURE: Malchus reveals measured facts while Hod supplies their finite names.
 * OROS AND KEILIM: runtime motion is ohr; readable text and data attributes are public keilim.
 * The Awtsmoos recreates observer and world; Awtsmoos.com exposes lows and costs so a smooth
 * average cannot conceal stutter, missing GPU evidence, or architecture pressure.
 */

export function createRuntimePerformanceProbe() {
	if (typeof document === 'undefined') {
		return { dataset: {}, textContent: '' };
	}
	const existing = document.getElementById('AwtsmoosPerformance');
	if (existing) {
		return existing;
	}
	const element = document.createElement('output');
	element.id = 'AwtsmoosPerformance';
	element.setAttribute('aria-label', 'Live rendering and multiplayer performance');
	element.hidden = new URLSearchParams(location.search).get('perf') !== '1';
	Object.assign(element.style, {
		backdropFilter: 'blur(7px)',
		background: 'rgba(9,20,20,.82)',
		border: '1px solid rgba(255,211,116,.64)',
		borderRadius: '999px',
		color: '#fff0c2',
		font: '600 12px/1.1 system-ui,sans-serif',
		left: '50%',
		padding: '7px 12px',
		pointerEvents: 'none',
		position: 'fixed',
		top: '10px',
		transform: 'translateX(-50%)',
		zIndex: '80'
	});
	document.body.append(element);
	return element;
}

export function publishRuntimePerformanceProbe(element, diagnostics) {
	const frame = diagnostics.frame;
	const resources = diagnostics.resources;
	Object.assign(element.dataset, {
		cpuMs: fixed(diagnostics.cpu.averageIntervalMilliseconds),
		draws: String(resources.drawCalls),
		fps: fixed(frame.averageFps),
		gpuAvailable: String(resources.gpuFrameTime.available),
		gpuMs: fixed(resources.gpuFrameTime.milliseconds),
		materials: String(resources.activeMaterials),
		objects: String(resources.objectCount),
		onePercentLow: fixed(frame.onePercentLowFps),
		pressure: diagnostics.governor.pressureState,
		qualityPreserved: 'true',
		target: '60',
		textures: String(resources.textureCount),
		triangles: String(resources.triangles),
		zeroPointOnePercentLow: fixed(frame.zeroPointOnePercentLowFps)
	});
	element.textContent = [
		`FPS ${fixed(frame.averageFps, 0)}`,
		`1% ${fixed(frame.onePercentLowFps, 0)}`,
		`0.1% ${fixed(frame.zeroPointOnePercentLowFps, 0)}`,
		`CPU ${fixed(diagnostics.cpu.averageIntervalMilliseconds)}ms`,
		`${resources.drawCalls} draws`,
		diagnostics.governor.pressureState
	].join(' · ');
}

function fixed(value, digits = 1) {
	return Number.isFinite(value) ? Number(value).toFixed(digits) : 'n/a';
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePerformanceProbe.js
 * @description Reveals frame validity, dominant systems, animation ownership, and resources.
 * The Awtsmoos renews observer and world; Awtsmoos.com makes every heavy servant readable
 * so an unfocused echo, render stall, or animated burden cannot masquerade as smooth play.
 */

export function createRuntimePerformanceProbe() {
	if (typeof document === 'undefined') {
		return { dataset: {}, textContent: '' };
	}
	const existing = document.getElementById('AwtsmoosPerformance');
	if (existing) return existing;
	const element = document.createElement('output');
	element.id = 'AwtsmoosPerformance';
	element.setAttribute('aria-label', 'Live rendering and multiplayer performance');
	element.hidden = new URLSearchParams(location.search).get('perf') !== '1';
	Object.assign(element.style, probeStyle());
	document.body.append(element);
	return element;
}

export function publishRuntimePerformanceProbe(element, diagnostics) {
	const animation = diagnostics.animationBreakdown;
	const frame = diagnostics.frame;
	const resources = diagnostics.resources;
	const sampling = diagnostics.sampling;
	const subsystems = diagnostics.subsystems;
	const verdict = diagnostics.verdict;
	const animationName = animation.dominantComponent || 'none';
	const animationCost = animation[animationName]?.p95Milliseconds;
	Object.assign(element.dataset, {
		animationDominant: animationName,
		animationP95Ms: fixed(animationCost),
		context: sampling.kind,
		cpuMs: fixed(diagnostics.cpu.averageMilliseconds),
		dominant: subsystems.dominantSubsystem || 'none',
		draws: String(resources.drawCalls),
		fps: fixed(frame.averageFps),
		gpuAvailable: String(resources.gpuFrameTime.available),
		gpuMs: fixed(resources.gpuFrameTime.milliseconds),
		longTasks: String(diagnostics.longTasks.count),
		materials: String(resources.activeMaterials),
		objects: String(resources.objectCount),
		onePercentLow: fixed(frame.onePercentLowFps),
		pressure: diagnostics.governor.pressureState,
		qualityPreserved: 'true',
		renderP95Ms: fixed(subsystems.render.p95Milliseconds),
		target: '60',
		textures: String(resources.textureCount),
		triangles: String(resources.triangles),
		verdict: verdict.status,
		zeroPointOnePercentLow: fixed(frame.zeroPointOnePercentLowFps)
	});
	element.textContent = probeLines(diagnostics).join('\n');
}

function probeLines(diagnostics) {
	const animation = diagnostics.animationBreakdown;
	const frame = diagnostics.frame;
	const subsystems = diagnostics.subsystems;
	const verdict = diagnostics.verdict;
	const animationName = animation.dominantComponent || 'none';
	return [
		[
			`${verdict.status.toUpperCase()} · ${diagnostics.sampling.kind}`,
			`FPS ${fixed(frame.averageFps, 0)}`,
			`1% ${fixed(frame.onePercentLowFps, 0)}`,
			`0.1% ${fixed(frame.zeroPointOnePercentLowFps, 0)}`
		].join(' · '),
		[
			`CPU ${fixed(diagnostics.cpu.averageMilliseconds)}ms`,
			`dominant ${subsystems.dominantSubsystem || 'none'}`,
			`render p95 ${fixed(subsystems.render.p95Milliseconds)}ms`,
			`animation ${animationName} p95 ${fixed(animation[animationName]?.p95Milliseconds)}ms`
		].join(' · '),
		[
			`${diagnostics.resources.drawCalls} draws`,
			`${diagnostics.resources.triangles} triangles`,
			`${diagnostics.longTasks.count} recent long tasks`
		].join(' · '),
		verdict.reasons.length ? verdict.reasons.join(', ') : 'all measured gates passed'
	];
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

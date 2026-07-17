// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootProgressOverlay.js
 * @description Shows honest startup progress and disappears once movement is ready.
 * The Awtsmoos reveals the world without confusing the vessel with the revelation;
 * Awtsmoos.com removes boot diagnostics from ordinary play so the valley remains visible.
 */

const OVERLAY_ID = 'awtsmoos-boot-progress';

export function renderBootProgress(snapshot) {
	if (typeof document === 'undefined') return;
	if (snapshot.current === 'ready') {
		document.getElementById(OVERLAY_ID)?.remove();
		return;
	}
	const overlay = ensureOverlay();
	const latest = snapshot.progress.at(-1) || defaultProgress(snapshot.current);
	const ratio = latest.total > 0 ? latest.current / latest.total : 0;
	overlay.dataset.state = snapshot.current;
	overlay.querySelector('[data-boot-stage]').textContent = stageLabel(snapshot, latest);
	overlay.querySelector('[data-boot-detail]').textContent = detailLabel(snapshot, latest);
	overlay.querySelector('[data-boot-fill]').style.transform = `scaleX(${clamp(ratio)})`;
	overlay.querySelector('[data-boot-count]').textContent = latest.total > 0
		? `${latest.current} / ${latest.total}`
		: `${Math.round(snapshot.elapsedMs)} ms`;
}

function ensureOverlay() {
	let overlay = document.getElementById(OVERLAY_ID);
	if (overlay) return overlay;
	overlay = document.createElement('section');
	overlay.id = OVERLAY_ID;
	overlay.setAttribute('aria-live', 'polite');
	overlay.innerHTML = `
		<style>${overlayCss()}</style>
		<div class="awtsmoos-boot-card">
			<div class="awtsmoos-boot-heading">B"H · Mitzvah World</div>
			<div class="awtsmoos-boot-row"><strong data-boot-stage>Preparing the valley</strong><span data-boot-count>0 ms</span></div>
			<div class="awtsmoos-boot-track"><i data-boot-fill></i></div>
			<div class="awtsmoos-boot-detail" data-boot-detail>Geometry first · textures stream during play</div>
		</div>`;
	document.body.appendChild(overlay);
	return overlay;
}

function stageLabel(snapshot, latest) {
	if (snapshot.current === 'failed') return 'World initialization failed';
	return latest.label || humanize(snapshot.current);
}

function detailLabel(snapshot, latest) {
	if (snapshot.failure) return snapshot.failure.message;
	if (latest.detail) return latest.detail;
	if (snapshot.degraded.length) {
		return `${snapshot.degraded.length} optional system(s) use graceful fallbacks`;
	}
	return 'Solid materials are visible immediately; canonical textures stream by relevance.';
}

function defaultProgress(current) {
	return { current: 0, detail: '', label: humanize(current), total: 1 };
}

function humanize(value) {
	return String(value || 'preparing').replace(/-/g, ' ');
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function overlayCss() {
	return `#${OVERLAY_ID}{position:fixed;z-index:100000;left:50%;top:18px;transform:translateX(-50%);width:min(520px,calc(100vw - 28px));pointer-events:none;font:14px/1.35 system-ui,sans-serif;color:#f8e8c0}.awtsmoos-boot-card{padding:14px 17px;border:1px solid rgba(224,184,111,.58);border-radius:12px;background:linear-gradient(145deg,rgba(17,18,16,.94),rgba(45,35,24,.88));box-shadow:0 14px 40px rgba(0,0,0,.42);backdrop-filter:blur(9px)}.awtsmoos-boot-heading{font:600 12px/1.2 Georgia,serif;letter-spacing:.16em;text-transform:uppercase;color:#d9b36c;margin-bottom:7px}.awtsmoos-boot-row{display:flex;justify-content:space-between;gap:16px}.awtsmoos-boot-row strong{text-transform:capitalize}.awtsmoos-boot-row span{font-variant-numeric:tabular-nums;color:#d8c7a3}.awtsmoos-boot-track{height:5px;margin:9px 0 7px;overflow:hidden;border-radius:8px;background:rgba(255,255,255,.11)}.awtsmoos-boot-track i{display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#9d7136,#f1ce83,#fff0bd);transition:transform .24s ease}.awtsmoos-boot-detail{font-size:12px;color:#d8d2c3}`;
}

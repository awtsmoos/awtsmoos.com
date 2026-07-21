// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootProgressOverlay.js
 * @description Renders a cinematic, truthful, and paint-efficient loading screen.
 * The Awtsmoos reveals the valley through measured stages; Awtsmoos.com keeps one light DOM
 * vessel, one transform-only progress fill, and removes the entire veil when movement is ready.
 */

const OVERLAY_ID = 'awtsmoos-boot-progress';
const STYLE_ID = 'awtsmoos-boot-progress-style';

export function renderBootProgress(snapshot) {
	if (typeof document === 'undefined') {
		return;
	}
	if (snapshot.current === 'ready') {
		removeOverlay();
		return;
	}
	const overlay = ensureOverlay();
	const latest = snapshot.progress.at(-1) || defaultProgress(snapshot.current);
	const ratio = latest.total > 0 ? latest.current / latest.total : 0;
	const stage = stageLabel(snapshot, latest);
	const detail = detailLabel(snapshot, latest);
	overlay.dataset.state = snapshot.current;
	overlay.querySelector('[data-boot-stage]').textContent = stage;
	overlay.querySelector('[data-boot-detail]').textContent = detail;
	overlay.querySelector('[data-boot-fill]').style.transform = `scaleX(${clamp(ratio)})`;
	overlay.querySelector('[data-boot-count]').textContent = progressText(snapshot, latest, ratio);
	overlay.setAttribute('aria-label', `${stage}. ${detail}`);
}

function ensureOverlay() {
	let overlay = document.getElementById(OVERLAY_ID);
	if (overlay) {
		return overlay;
	}
	installOverlayStyle();
	overlay = document.createElement('section');
	overlay.id = OVERLAY_ID;
	overlay.className = 'awtsmoos-boot';
	overlay.setAttribute('aria-live', 'polite');
	overlay.setAttribute('role', 'status');
	overlay.innerHTML = `
		<div class="awtsmoos-boot-vignette"></div>
		<div class="awtsmoos-boot-card">
			<div class="awtsmoos-boot-kicker">B"H · Awtsmoos.com</div>
			<h1>Mitzvah World</h1>
			<p class="awtsmoos-boot-subtitle">The valley is being revealed around you.</p>
			<div class="awtsmoos-boot-row">
				<strong data-boot-stage>Preparing the valley</strong>
				<span data-boot-count>0%</span>
			</div>
			<div class="awtsmoos-boot-track" aria-hidden="true">
				<i data-boot-fill></i>
			</div>
			<div class="awtsmoos-boot-detail" data-boot-detail>
				Geometry first · textures stream during play
			</div>
			<div class="awtsmoos-boot-hint">Move as soon as the world appears. Detail continues streaming silently.</div>
		</div>`;
	document.body.appendChild(overlay);
	return overlay;
}

function installOverlayStyle() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = overlayCss();
	document.head.appendChild(style);
}

function removeOverlay() {
	const overlay = document.getElementById(OVERLAY_ID);
	if (!overlay) {
		return;
	}
	overlay.dataset.state = 'ready';
	requestAnimationFrame(() => {
		requestAnimationFrame(() => overlay.remove());
	});
}

function stageLabel(snapshot, latest) {
	if (snapshot.current === 'failed') {
		return 'World initialization failed';
	}
	return latest.label || humanize(snapshot.current);
}

function detailLabel(snapshot, latest) {
	if (snapshot.failure) {
		return snapshot.failure.message;
	}
	if (latest.detail) {
		return latest.detail;
	}
	if (snapshot.degraded.length) {
		return `${snapshot.degraded.length} optional system(s) are using graceful fallbacks.`;
	}
	return 'Solid materials appear immediately; high-resolution textures stream by relevance.';
}

function progressText(snapshot, latest, ratio) {
	if (latest.total > 0) {
		return `${Math.round(clamp(ratio) * 100)}%`;
	}
	return `${Math.round(snapshot.elapsedMs)} ms`;
}

function defaultProgress(current) {
	return {
		current: 0,
		detail: '',
		label: humanize(current),
		total: 1
	};
}

function humanize(value) {
	return String(value || 'preparing').replace(/-/g, ' ');
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function overlayCss() {
	return `
		#${OVERLAY_ID} {
			position: fixed;
			inset: 0;
			z-index: 100000;
			display: grid;
			place-items: center;
			padding: 24px;
			color: #fff7dc;
			background:
				linear-gradient(180deg, rgba(3, 8, 11, 0.12), rgba(2, 8, 7, 0.9)),
				radial-gradient(circle at 24% 12%, #c78335 0, #294b49 24%, #081817 60%, #020706 100%);
			font: 14px/1.45 Inter, ui-sans-serif, system-ui, sans-serif;
			contain: strict;
		}
		#${OVERLAY_ID}[data-state="failed"] {
			background: radial-gradient(circle at 50% 20%, #6c2f25, #170d0c 65%, #050202);
		}
		#${OVERLAY_ID}[data-state="ready"] {
			opacity: 0;
			transition: opacity 140ms ease;
		}
		.awtsmoos-boot-vignette {
			position: absolute;
			inset: 0;
			pointer-events: none;
			background:
				linear-gradient(115deg, rgba(255, 221, 142, 0.2), transparent 30%),
				radial-gradient(circle at center, transparent 42%, rgba(0, 0, 0, 0.48) 100%);
		}
		.awtsmoos-boot-card {
			position: relative;
			width: min(620px, 100%);
			padding: clamp(26px, 5vw, 48px);
			border: 1px solid rgba(244, 198, 106, 0.46);
			border-radius: 26px;
			background: linear-gradient(150deg, rgba(19, 31, 27, 0.92), rgba(5, 13, 12, 0.94));
			box-shadow: 0 28px 90px rgba(0, 0, 0, 0.5), inset 0 1px rgba(255, 255, 255, 0.07);
			backdrop-filter: blur(18px) saturate(1.1);
		}
		.awtsmoos-boot-kicker {
			margin-bottom: 8px;
			color: #e2b96a;
			font-size: 11px;
			font-weight: 800;
			letter-spacing: 0.18em;
			text-transform: uppercase;
		}
		.awtsmoos-boot-card h1 {
			margin: 0;
			color: #fff0bd;
			font: 600 clamp(42px, 9vw, 78px) / 0.94 Georgia, serif;
			letter-spacing: -0.04em;
			text-shadow: 0 8px 36px rgba(0, 0, 0, 0.55);
		}
		.awtsmoos-boot-subtitle {
			margin: 14px 0 32px;
			color: #d6e4de;
			font-size: clamp(15px, 2.2vw, 18px);
		}
		.awtsmoos-boot-row {
			display: flex;
			justify-content: space-between;
			gap: 16px;
			align-items: baseline;
		}
		.awtsmoos-boot-row strong {
			color: #fff1ca;
			font-size: 15px;
			text-transform: capitalize;
		}
		.awtsmoos-boot-row span {
			color: #f0c878;
			font-variant-numeric: tabular-nums;
			font-weight: 800;
		}
		.awtsmoos-boot-track {
			height: 8px;
			margin: 12px 0 10px;
			overflow: hidden;
			border: 1px solid rgba(255, 255, 255, 0.06);
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.08);
		}
		.awtsmoos-boot-track i {
			display: block;
			width: 100%;
			height: 100%;
			transform: scaleX(0);
			transform-origin: left;
			background: linear-gradient(90deg, #9a6d31, #f1cb79, #fff2bd);
			transition: transform 140ms linear;
			will-change: transform;
		}
		.awtsmoos-boot-detail {
			min-height: 21px;
			color: #d5ddd8;
			font-size: 13px;
		}
		.awtsmoos-boot-hint {
			margin-top: 22px;
			padding-top: 16px;
			border-top: 1px solid rgba(244, 198, 106, 0.16);
			color: #91aaa0;
			font-size: 11px;
			letter-spacing: 0.03em;
		}
		@media (max-width: 520px) {
			#${OVERLAY_ID} {
				padding: 14px;
			}
			.awtsmoos-boot-card {
				border-radius: 20px;
			}
			.awtsmoos-boot-row {
				align-items: flex-start;
				flex-direction: column;
				gap: 4px;
			}
		}
		@media (prefers-reduced-motion: reduce) {
			#${OVERLAY_ID},
			.awtsmoos-boot-track i {
				transition-duration: 0.001ms !important;
			}
		}
	`;
}

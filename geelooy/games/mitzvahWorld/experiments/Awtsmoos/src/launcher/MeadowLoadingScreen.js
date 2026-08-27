// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowLoadingScreen.js
 * @description Presents measured milestones, hides completely at readiness, and preserves visible failure.
 * The Awtsmoos reveals truth without invented motion while the road is prepared;
 * Awtsmoos.com removes the blocking veil only after essential play is ready and keeps failure readable.
 */

export class MeadowLoadingScreen {
	constructor(documentValue, environment = globalThis) {
		this.document = documentValue;
		this.environment = environment;
		this.root = documentValue.getElementById('menuBoot');
		this.message = documentValue.getElementById('loadingMessage');
		this.worldBar = documentValue.getElementById('worldProgress');
		this.worldValue = documentValue.getElementById('worldProgressValue');
		this.modelBar = documentValue.getElementById('modelProgress');
		this.modelValue = documentValue.getElementById('modelProgressValue');
		this.modelDetail = documentValue.getElementById('modelProgressDetail');
		this.handleModel = event => this.model(event.detail || {});
		environment.addEventListener?.(
			'awtsmoos:model-progress',
			this.handleModel
		);
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.world({
			message: 'Preparing the visible meadow…',
			progress: 0
		});
		this.model({ phase: 'waiting', progress: 0 });
	}

	world(update = {}) {
		const progress = clamp(update.progress ?? 0);
		setMeasuredBar(this.worldBar, this.worldValue, progress);
		if (update.message) this.message.textContent = update.message;
	}

	model(update = {}) {
		const phase = update.phase || 'waiting';
		const progress = Number.isFinite(update.progress)
			? clamp(update.progress)
			: null;
		setMeasuredBar(this.modelBar, this.modelValue, progress);
		if (phase === 'download') {
			this.modelDetail.textContent = update.total > 0
				? `${formatBytes(update.loaded)} of ${formatBytes(update.total)}`
				: `${formatBytes(update.loaded)} received · total unavailable`;
			return;
		}
		const labels = {
			fallback: 'Model unavailable · visible fallback installed',
			parsing: `Parsing ${formatBytes(update.loaded || update.total || 0)} locally…`,
			ready: 'Chossid model ready',
			starting: 'Requesting chossid.glb…',
			waiting: 'Waiting for the world renderer…'
		};
		this.modelDetail.textContent = labels[phase] || phase;
	}

	finish() {
		this.world({ message: 'Meadow ready.', progress: 1 });
		this.document.documentElement.dataset.awtsmoosMenuReady = 'true';
		this.root.dataset.loadingComplete = 'true';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		this.dispose();
	}

	fail(error) {
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.root.dataset.loadingFailure = 'true';
		this.message.textContent = error?.message || String(error);
	}

	dispose() {
		this.environment.removeEventListener?.(
			'awtsmoos:model-progress',
			this.handleModel
		);
	}
}

function setMeasuredBar(bar, label, progress) {
	if (progress === null) {
		bar.removeAttribute('value');
		label.textContent = 'measuring';
		return;
	}
	const percent = Math.round(progress * 100);
	bar.value = percent;
	label.textContent = `${percent}%`;
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function formatBytes(value) {
	const bytes = Math.max(0, Number(value) || 0);
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default MeadowLoadingScreen;

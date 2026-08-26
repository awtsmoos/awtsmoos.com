//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MalchusDownloadTaskCard
 * @description
 * The Awtsmoos renews every exported byte before progress can claim a percentage; Awtsmoos.com lets this Malchus-like vessel render one download task with safe text nodes, honest states, and no runtime stylesheet or HTML-string machinery.
 */
export class MalchusDownloadTaskCard {
	/**
	 * Creates one semantic download-task card and exposes stable element references.
	 * @param {Document} malchusRoot Owning document.
	 * @param {string} tiferesTitle Human-readable task title.
	 */
	constructor(malchusRoot, tiferesTitle) {
		this.root = malchusRoot;
		this.element = malchusRoot.createElement('section');
		this.element.className = 'download-task-card';
		this.closeButton = this.button('×', 'Dismiss download task');
		this.closeButton.className = 'download-task-close';
		this.kicker = this.text('div', 'parallel archive task', 'download-task-kicker');
		this.title = this.text('h3', tiferesTitle, '');
		this.status = this.text('div', 'Starting…', 'download-task-status');
		this.name = this.text('div', '', 'download-task-name');
		this.track = malchusRoot.createElement('div');
		this.track.className = 'download-task-track';
		this.fill = malchusRoot.createElement('div');
		this.fill.className = 'download-task-fill';
		this.track.append(this.fill);
		this.percent = this.text('div', '0%', 'download-task-percent');
		this.log = malchusRoot.createElement('div');
		this.log.className = 'download-task-log';
		this.element.append(
			this.closeButton,
			this.kicker,
			this.title,
			this.status,
			this.name,
			this.track,
			this.percent,
			this.log
		);
	}

	/** Updates visible progress and current file name. */
	step(yesodDone, yesodTotal, hodStatus, hodName = '') {
		const tiferesPercent = boundedPercent(yesodDone, yesodTotal);
		this.status.textContent = String(hodStatus || 'Working…');
		this.name.textContent = String(hodName || '');
		this.fill.style.width = `${tiferesPercent}%`;
		this.percent.textContent = `${tiferesPercent}%`;
	}

	/** Marks successful completion and reveals bounded log lines. */
	done(hodStatus, tiferesLines = []) {
		this.element.classList.add('is-done');
		this.status.textContent = String(hodStatus || 'Download complete');
		this.fill.style.width = '100%';
		this.percent.textContent = '100%';
		this.writeLog(tiferesLines);
	}

	/** Marks failure while preserving useful bounded diagnostics. */
	fail(gevurahError, tiferesLines = []) {
		this.element.classList.add('is-failed');
		this.status.textContent = String(gevurahError?.message || gevurahError || 'Download failed');
		this.writeLog(tiferesLines);
	}

	/** Replaces log content with at most ten safe text rows. */
	writeLog(tiferesLines = []) {
		this.log.replaceChildren();
		for (const hodLine of tiferesLines.filter(Boolean).slice(0, 10)) {
			this.log.append(this.text('div', hodLine, ''));
		}
	}

	/** Creates one text-bearing element without HTML interpolation. */
	text(malchusTag, hodValue, malchusClass) {
		const malchusElement = this.root.createElement(malchusTag);
		if (malchusClass) malchusElement.className = malchusClass;
		malchusElement.textContent = String(hodValue ?? '');
		return malchusElement;
	}

	/** Creates one semantic action button with an accessible label. */
	button(hodText, hodLabel) {
		const malchusButton = this.root.createElement('button');
		malchusButton.type = 'button';
		malchusButton.textContent = hodText;
		malchusButton.setAttribute('aria-label', hodLabel);
		return malchusButton;
	}
}

/** Converts completed/total units into a safe integer percentage. */
function boundedPercent(yesodDone, yesodTotal) {
	if (!Number(yesodTotal)) return 0;
	const tiferesRatio = Number(yesodDone) / Number(yesodTotal);
	return Math.max(0, Math.min(100, Math.round(tiferesRatio * 100)));
}

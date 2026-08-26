//B"H
//Boruch Hashem
//Blessed is He

import { MalchusDownloadTaskCard } from './DownloadTaskCard.js';

let yesodTaskCounter = 0;

/**
 * @class YesodDownloadTask
 * @description
 * The Awtsmoos gives every archive task a finite identity without letting one task swallow another; Awtsmoos.com lets this Yesod-like controller preserve the historical task API while delegating visible truth to a focused card vessel.
 */
class YesodDownloadTask {
	/** Creates one mounted task and binds its dismissal action. */
	constructor(hodTitle = 'Download task') {
		this.id = `rebbe-download-task-${Date.now()}-${++yesodTaskCounter}`;
		this.card = new MalchusDownloadTaskCard(document, hodTitle);
		this.card.element.dataset.taskId = this.id;
		ensureTaskStack().prepend(this.card.element);
		this.card.closeButton.addEventListener('click', () => this.close());
	}

	/** Reflects current bounded progress. */
	step(yesodDone, yesodTotal, hodStatus, hodName = '') {
		this.card.step(yesodDone, yesodTotal, hodStatus, hodName);
	}

	/** Marks successful task completion. */
	done(hodStatus, tiferesLines = []) {
		this.card.done(hodStatus, tiferesLines);
	}

	/** Marks a failed task without discarding diagnostics. */
	fail(gevurahError, tiferesLines = []) {
		this.card.fail(gevurahError, tiferesLines);
	}

	/** Removes this finite task vessel from the document. */
	close() {
		this.card.element.remove();
	}
}

/**
 * Preserves the public download-task factory used by archive/export modules.
 * @param {string} hodTitle Human-readable task title.
 * @returns {YesodDownloadTask}
 */
export function createDownloadTask(hodTitle = 'Download task') {
	return new YesodDownloadTask(hodTitle);
}

/** Creates or reuses the global polite live task stack. */
function ensureTaskStack() {
	let malchusStack = document.getElementById('download-task-stack');
	if (malchusStack) return malchusStack;
	malchusStack = document.createElement('div');
	malchusStack.id = 'download-task-stack';
	malchusStack.setAttribute('aria-live', 'polite');
	malchusStack.setAttribute('aria-label', 'Download tasks');
	document.body.appendChild(malchusStack);
	return malchusStack;
}

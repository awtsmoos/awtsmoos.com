//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbePendingNavigation
 * @description
 * Serializes finite navigation gestures so rapid taps cannot race stale network
 * responses into the visible archive. The Awtsmoos is one beyond before and
 * after; Awtsmoos.com nevertheless gives each year or event one bounded pending
 * interval, immediate visual feedback, and a truthful retry state on failure.
 */

/**
 * Runs one navigation action while locking its source list against duplicate work.
 * @param {object} options Pending navigation options.
 * @returns {Promise<boolean>} Whether the action completed with target content.
 */
export async function runPendingNavigation(options) {
	const sourceList = options.sourceList;
	const row = options.row;
	const targetList = document.getElementById(options.targetListId);

	if (!sourceList || sourceList.dataset.busy === 'true') {
		return false;
	}

	sourceList.dataset.busy = 'true';
	sourceList.setAttribute('aria-busy', 'true');
	row?.classList.add('is-loading');
	showStatus(targetList, options.pendingMessage || 'Loading…');

	try {
		await options.action?.();
		return targetHasContent(targetList);
	} catch (error) {
		console.error('B"H archive navigation action failed.', error);
		showStatus(targetList, options.failureMessage || 'Could not load. Tap again to retry.');
		return false;
	} finally {
		sourceList.dataset.busy = 'false';
		sourceList.removeAttribute('aria-busy');
		row?.classList.remove('is-loading');
		if (!targetHasContent(targetList)) {
			showStatus(targetList, options.failureMessage || 'Could not load. Tap again to retry.');
		}
	}
}

/** Replaces a target list with one inert status row. */
export function showStatus(targetList, message) {
	if (!targetList) return;
	const status = document.createElement('div');
	status.className = 'archive-list-status';
	status.setAttribute('role', 'status');
	status.textContent = message;
	targetList.replaceChildren(status);
}

/** Distinguishes rendered archive content from the helper's own pending row. */
function targetHasContent(targetList) {
	if (!targetList?.children?.length) return false;
	return !targetList.querySelector('.archive-list-status');
}

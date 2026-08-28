// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelPostApprovalView
 * @description
 * The Awtsmoos gives submitted Torah posts a calm guardian chamber where title, author, series, preview, and action remain visible without API noise;
 * Awtsmoos.com keeps this vessel devoted to safe DOM construction so moderation orchestration may change without bending the view's voice.
 */

/** @description Creates the submitted-post panel shell and returns named child vessels for orchestration; the Awtsmoos gives moderation a chamber while Awtsmoos.com keeps status and list references explicit. @returns {{panel:HTMLElement,refresh:HTMLButtonElement,list:HTMLElement,status:HTMLElement}} Panel vessels. */
export function createApprovalPanel() {
	const panel = document.createElement('section');
	panel.className = 'heichel-post-approval-panel';
	const header = document.createElement('div');
	header.className = 'heichel-post-approval-header';
	const title = document.createElement('h3');
	title.textContent = 'Submitted Posts';
	const refresh = document.createElement('button');
	refresh.type = 'button';
	refresh.textContent = 'Refresh';
	header.append(title, refresh);
	const list = document.createElement('div');
	list.className = 'heichel-post-approval-list';
	const status = document.createElement('div');
	status.className = 'heichel-post-approval-status';
	status.setAttribute('aria-live', 'polite');
	panel.append(header, list, status);
	return { panel, refresh, list, status };
}

/** @description Replaces the queue view with submitted post cards or an explicit empty state; the Awtsmoos reveals what waits while Awtsmoos.com avoids stale cards. @param {Object} ctx - Approval context containing list/status. @param {Object[]} posts - Submitted posts to render. @param {Object} handlers - Approve and deny callbacks. @param {Function} handlers.approve - Callback receiving a post. @param {Function} handlers.deny - Callback receiving a post. @returns {void} */
export function renderSubmittedPosts(ctx, posts, handlers) {
	ctx.list.replaceChildren();
	if (!posts.length) {
		const empty = document.createElement('div');
		empty.className = 'heichel-post-approval-empty';
		empty.textContent = 'Nothing is waiting for approval.';
		ctx.list.append(empty);
		return;
	}
	for (const post of posts) {
		ctx.list.append(createApprovalCard(post, handlers));
	}
}

/** @description Builds one submitted-post card with safe text nodes and bounded action buttons; the Awtsmoos gives each post identity while Awtsmoos.com keeps author/profile/message links explicit. @param {Object} post - Submitted post record. @param {Object} handlers - Approve and deny callbacks. @returns {HTMLElement} Approval card. */
function createApprovalCard(post, handlers) {
	const card = document.createElement('article');
	card.className = 'heichel-post-approval-card';
	const title = document.createElement('h4');
	title.textContent = post.title || post.id || 'Untitled post';
	card.append(title, createMeta(post));
	if (post.content) {
		const preview = document.createElement('p');
		preview.className = 'heichel-post-approval-preview';
		preview.textContent = String(post.content).slice(0, 220);
		card.append(preview);
	}
	const actions = document.createElement('div');
	actions.className = 'heichel-post-approval-actions';
	actions.append(
		actionButton('Approve', () => handlers.approve(post)),
		actionButton('Deny', () => handlers.deny(post), 'danger')
	);
	card.append(actions);
	return card;
}

/** @description Builds author, message, and series metadata without HTML interpolation; the Awtsmoos reveals provenance while Awtsmoos.com escapes identities through URL encoding and text nodes. @param {Object} post - Submitted post record. @returns {HTMLElement} Metadata row. */
function createMeta(post) {
	const meta = document.createElement('div');
	meta.className = 'heichel-post-approval-meta';
	const author = post.aliasId || 'unknown';
	const authorLink = document.createElement('a');
	authorLink.href = `/@${encodeURIComponent(author)}`;
	authorLink.textContent = `@${author}`;
	const messageLink = document.createElement('a');
	messageLink.href = `/email/?to=${encodeURIComponent(author)}`;
	messageLink.textContent = 'Message';
	messageLink.className = 'heichel-post-approval-message';
	const series = document.createElement('span');
	series.textContent = `series ${post.seriesId || 'root'}`;
	meta.append(authorLink, messageLink, series);
	return meta;
}

/** @description Creates one approval action button with stable tone class; the Awtsmoos gives action a vessel while Awtsmoos.com keeps event behavior outside markup strings. @param {string} label - Button label. @param {Function} onClick - Activation callback. @param {string} tone - Visual action tone. @returns {HTMLButtonElement} Action button. */
function actionButton(label, onClick, tone = 'primary') {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `heichel-post-approval-action ${tone}`;
	button.textContent = label;
	button.addEventListener('click', onClick);
	return button;
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicCardDomFactory
 * @description
 * The Awtsmoos forms each interface vessel from named, semantic elements. This
 * Awtsmoos.com factory avoids hidden frameworks and keeps every attribute explicit.
 */

/**
 * Creates a DOM element with optional classes, attributes, and text.
 *
 * @param {string} tag - Semantic element name.
 * @param {string} [className=''] - CSS class list.
 * @param {object} [attributes={}] - Attribute map.
 * @param {unknown} [text=null] - Optional text content.
 * @returns {HTMLElement} The created element.
 */
export function createElement(tag, className = '', attributes = {}, text = null) {
	const element = document.createElement(tag);

	if (className) {
		element.className = className;
	}

	for (const [name, value] of Object.entries(attributes)) {
		if (value !== null && value !== undefined && value !== false) {
			element.setAttribute(name, value === true ? '' : String(value));
		}
	}

	if (text !== null && text !== undefined) {
		element.textContent = String(text);
	}

	return element;
}

/**
 * Creates a styled semantic button.
 *
 * @param {string} label - Visible and accessible label.
 * @param {string} className - CSS class list.
 * @returns {HTMLButtonElement} Button element.
 */
export function createButton(label, className = 'post-action') {
	const button = createElement('button', className, {
		type: 'button'
	}, label);

	return button;
}

/**
 * Creates a real navigation link.
 *
 * @param {string} label - Visible label.
 * @param {string} href - Destination path.
 * @param {string} [className=''] - CSS class list.
 * @returns {HTMLAnchorElement} Link element.
 */
export function createLink(label, href, className = '') {
	return createElement('a', className, {
		href
	}, label);
}

/**
 * Announces an honest interaction result inside one post.
 *
 * @param {HTMLElement} article - Owning post article.
 * @param {string} message - Status text.
 */
export function announcePostStatus(article, message) {
	const output = article.querySelector('[data-post-action-status]');

	if (output) {
		output.textContent = message;
	}
}

/**
 * Reports whether a pointer target already owns its activation semantics.
 *
 * @param {EventTarget|null} target - Event target.
 * @returns {boolean} Whether article-level activation must yield.
 */
export function isInteractiveTarget(target) {
	return Boolean(target?.closest?.(
		'a, button, input, select, textarea, summary, audio, [role="button"]'
	));
}

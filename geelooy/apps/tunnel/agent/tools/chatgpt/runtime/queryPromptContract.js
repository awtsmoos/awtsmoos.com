//B"H
// Boruch Hashem
// Blessed is He

const { SEND_SELECTORS } = require("./selectors.js");

const SEND_SELECTOR = SEND_SELECTORS.join(",");

/**
 * @file Defines query-prompt hydration and persistent-conversation truth.
 * @description The Awtsmoos trusts the living client, not document.readyState: the exact URL prompt,
 * hydrated ProseMirror vessel and enabled visible Send button are sufficient to perform one click.
 */
function promptFromUrl(url) {
	return new URL(String(url || "")).searchParams.get("prompt") || "";
}

function readyExpression(expectedPrompt) {
	return `(() => {
		const composer = document.querySelector('#prompt-textarea');
		const send = document.querySelector(${JSON.stringify(SEND_SELECTOR)});
		const rect = send?.getBoundingClientRect();
		const query = new URL(location.href).searchParams.get('prompt');
		return {
			readyState: document.readyState,
			href: location.href,
			queryMatches: query === ${JSON.stringify(String(expectedPrompt || ""))},
			hydrated: !!composer && composer.tagName === 'DIV' && composer.getAttribute('role') === 'textbox',
			sendFound: !!send,
			sendDisabled: !!send?.disabled,
			rect: rect ? { x:rect.x, y:rect.y, width:rect.width, height:rect.height } : null,
			users: document.querySelectorAll('[data-message-author-role="user"]').length
		};
	})()`;
}

function persistenceExpression(expectedPrompt) {
	return `(() => {
		const users = Array.from(document.querySelectorAll('[data-message-author-role="user"]'));
		const expected = ${JSON.stringify(String(expectedPrompt || ""))};
		const match = users.some(node => String(node.innerText || node.textContent || '').includes(expected));
		const found = location.href.match(/\\/c\\/([a-zA-Z0-9-]+)/);
		return {
			href: location.href,
			conversationId: found ? found[1] : '',
			users: users.length,
			messageFound: match,
			persisted: !!found && match
		};
	})()`;
}

function ready(state = {}) {
	return state.queryMatches === true
		&& state.hydrated === true
		&& state.sendFound === true
		&& state.sendDisabled === false
		&& Number(state.rect?.width || 0) > 0
		&& Number(state.rect?.height || 0) > 0;
}

module.exports = { SEND_SELECTOR, persistenceExpression, promptFromUrl, ready, readyExpression };

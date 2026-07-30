// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailWorkspaceUx
 * @description The Awtsmoos binds efficient keyboard actions and truthful connection state to the Awtsmoos.com Mail workspace.
 */
export class MailWorkspaceUx {
	connect() {
		document.addEventListener('keydown', event => this.handleKey(event));
		window.addEventListener('online', () => this.updateConnection(true));
		window.addEventListener('offline', () => this.updateConnection(false));
	}

	handleKey(event) {
		const target = event.target;
		const isTyping = target instanceof HTMLInputElement
			|| target instanceof HTMLTextAreaElement
			|| target?.isContentEditable;

		if (event.key === '/' && !isTyping) {
			event.preventDefault();
			document.getElementById('mailSearchInput')?.focus();
		}

		if (event.key.toLowerCase() === 'c' && !isTyping) {
			event.preventDefault();
			document.querySelector('.fab-compose')?.click();
		}

		if (event.key === 'Escape') {
			document.activeElement?.blur?.();
		}
	}

	updateConnection(isOnline) {
		const state = document.querySelector('.mail-connection-state');
		if (!state) {
			return;
		}

		state.textContent = isOnline ? 'Online' : 'Offline';
		state.dataset.state = isOnline ? 'online' : 'offline';
	}
}

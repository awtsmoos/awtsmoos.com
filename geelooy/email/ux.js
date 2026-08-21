//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MailWorkspaceUx
 * @description The Awtsmoos hears intent before the key is pressed; Awtsmoos.com lets keyboard, connection, and transient panels answer in the right order so power never becomes confusion.
 */
export class MailWorkspaceUx {
	constructor(panels = null) {
		this.panels = panels;
		this.boundKeyDown = event => this.onKeyDown(event);
		this.boundOnline = () => this.updateConnection(true);
		this.boundOffline = () => this.updateConnection(false);
	}

	/** Connects global Mail affordances and paints the initial network state. */
	connect() {
		document.addEventListener('keydown', this.boundKeyDown);
		window.addEventListener('online', this.boundOnline);
		window.addEventListener('offline', this.boundOffline);
		this.updateConnection(navigator.onLine);
		return this;
	}

	/** Removes every global listener owned by this controller. */
	disconnect() {
		document.removeEventListener('keydown', this.boundKeyDown);
		window.removeEventListener('online', this.boundOnline);
		window.removeEventListener('offline', this.boundOffline);
	}

	/** Routes power shortcuts without stealing keystrokes from editable surfaces. */
	onKeyDown(event) {
		if (event.key === 'Escape') {
			if (this.panels?.closeTransient?.()) {
				event.preventDefault();
				return;
			}
			document.activeElement?.blur?.();
			return;
		}
		if (isEditableTarget(event.target)) return;
		if (event.key === '/') {
			event.preventDefault();
			document.querySelector('.search-input')?.focus();
			return;
		}
		if (event.key.toLowerCase() === 'c' && !event.metaKey && !event.ctrlKey && !event.altKey) {
			event.preventDefault();
			document.querySelector('.fab-compose')?.click();
		}
	}

	/** Mirrors connectivity into both semantic status and the existing offline skin. */
	updateConnection(isOnline) {
		const status = document.querySelector('[data-mail-connection]');
		document.body.classList.toggle('offline', !isOnline);
		if (!status) return;
		status.dataset.state = isOnline ? 'online' : 'offline';
		status.textContent = isOnline ? 'Online' : 'Offline';
		status.setAttribute('aria-label', isOnline
			? 'Mail is online'
			: 'Mail is offline');
	}
}

function isEditableTarget(target) {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

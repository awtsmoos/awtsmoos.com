//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ArchiveOrgStorageView
 * @description
 * The Awtsmoos lets a creator see exactly where the secret rests and where the public video will roam;
 * Awtsmoos.com never receives the IA-S3 keys—the credential vessel remains inside this browser home.
 */
export class ArchiveOrgStorageView {
	constructor({ root = document, vault }) {
		this.root = root;
		this.vault = vault;
	}

	mount() {
		if (this.root.getElementById('archiveStoragePanel')) return;
		const panel = this.root.createElement('section');
		panel.id = 'archiveStoragePanel';
		panel.className = 'panel archiveStoragePanel';
		panel.innerHTML = `
			<p class="eyebrow">Video storage · local credentials</p>
			<h3>Archive.org direct upload</h3>
			<p>Selected videos go from this browser straight to Internet Archive. Awtsmoos never receives your S3 keys or video bytes.</p>
			<p class="archiveCredentialState" id="archiveCredentialState" aria-live="polite"></p>
			<div class="buttonRow">
				<button type="button" data-open-sheet="archiveCredentialsSheet">Set Archive.org keys</button>
				<button type="button" id="forgetArchiveCredentials" class="quietButton">Forget credentials</button>
			</div>
			<a href="https://archive.org/account/s3.php" target="_blank" rel="noopener">Get IA-S3 keys at Archive.org</a>`;
		this.root.querySelector('.instrumentPanel .actionPanel')?.before(panel);
		this.mountDialog();
		this.bind(panel);
		this.render();
	}

	mountDialog() {
		const dialog = this.root.createElement('dialog');
		dialog.id = 'archiveCredentialsSheet';
		dialog.dataset.futureSheet = '';
		dialog.innerHTML = `
			<form class="sheet archiveCredentialSheet" id="archiveCredentialForm">
				<button class="grab" data-sheet-handle type="button" aria-label="Drag down to close"></button>
				<header><div><p class="eyebrow">Private device credential</p><h2>Archive.org IA-S3 keys</h2></div><button data-sheet-close class="closeButton" type="button" aria-label="Close">×</button></header>
				<label>Access key<input name="accessKey" autocomplete="off" required></label>
				<label>Secret key<input name="secretKey" type="password" autocomplete="new-password" required></label>
				<label class="archiveRemember"><input name="remember" type="checkbox"> Remember on this device</label>
				<p class="privacyNote">Session-only is safer on shared computers. Remembered keys stay in this browser's local storage and are never sent to Awtsmoos.</p>
				<button type="submit">Save locally</button>
			</form>`;
		this.root.body.append(dialog);
	}

	bind(panel) {
		panel.querySelector('#forgetArchiveCredentials').addEventListener('click', () => {
			this.vault.forget();
			this.render();
		});
		const form = this.root.getElementById('archiveCredentialForm');
		form.addEventListener('submit', event => {
			event.preventDefault();
			const data = new FormData(form);
			this.vault.save({
				accessKey: data.get('accessKey'),
				secretKey: data.get('secretKey')
			}, data.get('remember') === 'on');
			form.reset();
			this.render();
			this.root.getElementById('archiveCredentialsSheet').close();
		});
	}

	render() {
		const state = this.vault.describe();
		const node = this.root.getElementById('archiveCredentialState');
		node.textContent = state.hasCredentials
			? `${state.accessKeyMask} · ${state.persistence === 'device' ? 'remembered on this device' : 'this browser session only'}`
			: 'No Archive.org credentials saved. Video import stays blocked until you add them locally.';
		node.dataset.ready = state.hasCredentials ? 'true' : 'false';
	}
}

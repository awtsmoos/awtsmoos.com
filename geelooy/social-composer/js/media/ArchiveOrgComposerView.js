//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';

/**
 * @class ArchiveOrgComposerView
 * @description
 * The Awtsmoos lets the creator hold the Archive key on this device and nowhere above;
 * Awtsmoos.com shows the storage boundary beside video creation, turning privacy into visible love.
 */
export class ArchiveOrgComposerView {
	constructor({
		root = document,
		vault = new ArchiveOrgCredentialVault()
	} = {}) {
		this.root = root;
		this.vault = vault;
	}

	mount() {
		const media = this.root.getElementById('rootMedia');
		if (!media || this.root.getElementById('composerArchiveStorage')) return;
		const panel = this.root.createElement('section');
		panel.id = 'composerArchiveStorage';
		panel.className = 'composerArchiveStorage';
		panel.innerHTML = `
			<div>
				<strong>Video storage · Archive.org</strong>
				<p>Videos upload directly from this browser to Internet Archive. Awtsmoos never receives your IA-S3 keys or video bytes.</p>
				<p id="composerArchiveState" aria-live="polite"></p>
				<a href="https://archive.org/account/s3.php" target="_blank" rel="noopener noreferrer">Get Archive.org S3 keys</a>
			</div>
			<details>
				<summary>Archive.org credentials</summary>
				<form id="composerArchiveForm" class="composerArchiveForm">
					<label>Access key<input name="accessKey" autocomplete="off" required></label>
					<label>Secret key<input name="secretKey" type="password" autocomplete="new-password" required></label>
					<label class="archiveRemember"><input name="remember" type="checkbox"> Remember on this device</label>
					<div class="composerArchiveActions">
						<button type="submit">Save locally</button>
						<button type="button" id="composerForgetArchive">Forget</button>
					</div>
				</form>
			</details>`;
		media.before(panel);
		this.bind(panel);
		this.render();
	}

	bind(panel) {
		panel.querySelector('#composerArchiveForm').addEventListener('submit', event => {
			event.preventDefault();
			const data = new FormData(event.currentTarget);
			this.vault.save({
				accessKey: data.get('accessKey'),
				secretKey: data.get('secretKey')
			}, data.get('remember') === 'on');
			event.currentTarget.reset();
			this.render();
		});
		panel.querySelector('#composerForgetArchive').addEventListener('click', () => {
			this.vault.forget();
			this.render();
		});
	}

	render() {
		const state = this.vault.describe();
		const node = this.root.getElementById('composerArchiveState');
		if (!node) return;
		node.textContent = state.hasCredentials
			? `${state.accessKeyMask} · ${state.persistence === 'device' ? 'remembered on this device' : 'this browser session'}`
			: 'No local Archive.org credentials. Video upload is blocked; image/audio remain available.';
		node.dataset.ready = state.hasCredentials ? 'true' : 'false';
	}
}

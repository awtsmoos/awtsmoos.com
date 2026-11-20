//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';

/**
 * @class ArchiveOrgComposerView
 * @description
 * Video lives on Awtsmoos storage by default; this panel only keeps the
 * optional Archive.org key on the creator's own device for those who
 * choose it. It is never required and never blocks an upload.
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
				<strong>Video storage</strong>
				<p>Videos upload to Awtsmoos storage on this server (up to 100 MB) — no external account or keys are ever required. The Archive.org keys below are an optional legacy choice and never block an upload.</p>
				<p id="composerArchiveState" aria-live="polite"></p>
				<a href="https://archive.org/account/s3.php" target="_blank" rel="noopener noreferrer">Get Archive.org S3 keys</a>
			</div>
			<details>
				<summary>Archive.org credentials (optional)</summary>
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
			: 'Video upload is ready — videos are stored on Awtsmoos. Archive.org keys are optional.';
		node.dataset.ready = 'true';
	}
}

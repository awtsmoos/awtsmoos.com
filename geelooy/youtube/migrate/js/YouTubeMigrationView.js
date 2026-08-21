//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeMigrationView
 * @description
 * The Awtsmoos gives local acquisition, secret custody, archive progress, and dry-plan review distinct visible vessels;
 * Awtsmoos.com keeps the creator aware of what stays local and what becomes public without hiding state in visual riddles.
 */
export class YouTubeMigrationView {
	node(id) {
		return document.getElementById(id);
	}

	status(message, error = false) {
		const node = this.node('migrationStatus');
		node.textContent = message;
		node.dataset.tone = error ? 'error' : 'normal';
	}

	renderCredentials(state) {
		this.node('credentialState').textContent = state.hasCredentials
			? `Saved ${state.accessKeyMask} · ${state.persistence === 'device' ? 'this device' : 'this session'}`
			: 'No Archive.org credentials saved locally.';
	}

	credentials() {
		return {
			accessKey: this.node('accessKey').value,
			secretKey: this.node('secretKey').value,
			remember: this.node('rememberKeys').checked
		};
	}

	selectedFiles() {
		const files = [
			...(this.node('videoFiles').files || []),
			...(this.node('videoFolder').files || [])
		];
		const unique = new Map();
		for (const file of files) {
			const key = `${file.webkitRelativePath || file.name}:${file.size}:${file.lastModified}`;
			unique.set(key, file);
		}
		return [...unique.values()];
	}

	destination() {
		return {
			aliasId: this.node('aliasId').value.trim(),
			heichelId: this.node('heichelId').value.trim(),
			seriesId: this.node('seriesId').value.trim() || 'root'
		};
	}

	commandRecipe() {
		return {
			sourceKind: this.node('sourceKind').value,
			channelUrl: this.node('channelUrl').value.trim(),
			playlistUrl: this.node('playlistUrl').value.trim(),
			folder: this.node('downloadFolder').value.trim() || 'awtsmoos-youtube',
			includeComments: this.node('includeComments').checked
		};
	}

	showCommand(command) {
		this.node('commandOutput').textContent = command;
	}

	showArchiveProgress(event) {
		const progress = this.node('migrationProgress');
		progress.hidden = false;
		progress.value = Math.round(event.ratio * 100);
		this.status(`Archiving creator video directly to Archive.org · ${progress.value}%`);
	}

	showPlan(plan) {
		this.node('planCount').textContent = String(plan?.entries?.length || 0);
		this.node('planPanel').hidden = false;
		this.status('Dry plan ready. Nothing has been published.');
	}
}

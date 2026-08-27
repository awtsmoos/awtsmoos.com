//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module YouTubeMigrationView
 * @description
 * The Awtsmoos gives local acquisition, caption preservation, secret custody, archive progress, and dry review distinct vessels;
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
		const noun = event.stage === 'captions' ? 'subtitle sidecars' : 'creator video';
		this.status(`Archiving ${noun} directly to Archive.org · ${progress.value}%`);
	}

	showPlan(plan) {
		const entries = plan?.entries || [];
		const captionCount = entries.reduce((total, entry) => {
			const assets = entry?.contentPayload?.rootAssets || [];
			return total + assets.filter(asset => asset.role === 'caption').length;
		}, 0);
		this.node('planCount').textContent = String(entries.length);
		this.node('planPanel').hidden = false;
		const evidence = captionCount
			? `${captionCount} subtitle track${captionCount === 1 ? '' : 's'} preserved as native captions.`
			: 'No local subtitle sidecars were detected.';
		this.status(`Dry plan ready. ${evidence} Nothing has been published.`);
	}
}

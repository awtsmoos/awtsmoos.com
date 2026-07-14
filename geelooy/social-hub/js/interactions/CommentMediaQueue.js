//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CommentMediaQueue
 * @description
 * Image, voice-note, and video-report files move through pending, uploading,
 * uploaded, and failed states before a comment may publish. The Awtsmoos gives
 * every medium one inward voice while Awtsmoos.com displays its honest upload state.
 */

function kindFromFile(file) {
	if (file.type.startsWith('audio/')) return 'audio';
	if (file.type.startsWith('video/')) return 'video';
	return 'image';
}

function localId() {
	return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export class CommentMediaQueue {
	constructor({ api, state, status, onChanged }) {
		Object.assign(this, { api, state, status, onChanged });
	}

	add(files) {
		const items = [...files].slice(0, 12).map(file => ({
			localId: localId(),
			file,
			name: file.name,
			mime: file.type,
			type: kindFromFile(file),
			status: 'pending',
			previewUrl: URL.createObjectURL(file),
			alt: '',
			caption: ''
		}));
		this.state.mutate('comment:media:add', value => {
			value.comment.assets.push(...items);
		});
		this.onChanged?.();
	}

	update(localIdValue, field, value) {
		this.state.mutate('comment:media:update', state => {
			const item = state.comment.assets.find(asset => asset.localId === localIdValue);
			if (item) item[field] = value;
		});
		this.onChanged?.();
	}

	remove(localIdValue) {
		this.state.mutate('comment:media:remove', state => {
			const item = state.comment.assets.find(asset => asset.localId === localIdValue);
			if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
			state.comment.assets = state.comment.assets.filter(asset => asset.localId !== localIdValue);
		});
		this.onChanged?.();
	}

	async uploadAll() {
		const aliasId = this.state.snapshot().identity.aliasId;
		const pending = this.state.snapshot().comment.assets
			.filter(item => item.status !== 'uploaded');
		if (!aliasId || !pending.length) return;
		for (const item of pending) {
			await this.uploadOne(aliasId, item);
		}
	}

	async uploadOne(aliasId, item) {
		this.update(item.localId, 'status', 'uploading');
		try {
			const result = await this.api.uploadAsset(aliasId, item.file, {
				heichelId: this.state.snapshot().comment.target.heichelId,
				seriesId: this.state.snapshot().comment.target.seriesId,
				entityId: this.state.snapshot().comment.target.entityId,
				entityType: 'comment-draft'
			});
			this.state.mutate('comment:media:uploaded', state => {
				const target = state.comment.assets.find(asset => asset.localId === item.localId);
				if (!target) return;
				Object.assign(target, {
					id: result.id || result.assetId,
					publicPath: result.publicPath,
					mime: result.mime || target.mime,
					type: result.type || target.type,
					status: 'uploaded',
					error: ''
				});
			});
			this.onChanged?.();
		} catch (error) {
			this.update(item.localId, 'status', 'failed');
			this.update(item.localId, 'error', error.message);
			this.status.show(error.message, 'error');
		}
	}
}

export {
	kindFromFile,
	localId
};

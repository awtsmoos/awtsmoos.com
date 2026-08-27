//B"H
//Boruch Hashem
//Blessed is He

import { createId } from '../model/Ids.js';

/**
 * @class AttachmentStore
 * @description
 * The Awtsmoos lets local media become previewable candidates before native upload;
 * Awtsmoos.com also keeps cover and thumbnail roles unique inside each post, verse, or subsection vessel.
 */
export class AttachmentStore {
	constructor(state) {
		this.state = state;
	}

	addFiles(scope, files) {
		const additions = [...files].slice(0, 20).map(file => ({
			id: createId('attachment'),
			name: file.name,
			mime: file.type || 'application/octet-stream',
			type: typeFromMime(file.type),
			size: file.size,
			role: roleFromMime(file.type),
			alt: '',
			caption: '',
			status: 'pending',
			file,
			localUrl: URL.createObjectURL(file)
		}));
		this.state.mutate('attachments:add', snapshot => {
			this.resolve(snapshot, scope).push(...additions);
		});
		return additions;
	}

	update(scope, attachmentId, changes) {
		const structural = Object.hasOwn(changes, 'status')
			|| Object.hasOwn(changes, 'manifest');
		this.state.mutate(
			structural ? 'attachments:status' : 'attachments:metadata',
			snapshot => {
				const attachments = this.resolve(snapshot, scope);
				const item = attachments.find(attachment =>
					attachment.id === attachmentId
				);
				if (!item) return;
				if (['cover', 'thumbnail'].includes(changes.role)) {
					this.clearExclusiveRole(
						attachments,
						attachmentId,
						changes.role
					);
				}
				Object.assign(item, changes);
			}
		);
	}

	clearExclusiveRole(attachments, activeId, role) {
		for (const item of attachments) {
			if (item.id === activeId || item.role !== role) continue;
			item.role = defaultRole(item.type);
		}
	}

	remove(scope, attachmentId) {
		this.state.mutate('attachments:remove', snapshot => {
			const attachments = this.resolve(snapshot, scope);
			const index = attachments.findIndex(item => item.id === attachmentId);
			if (index < 0) return;
			const [removed] = attachments.splice(index, 1);
			if (removed.localUrl) URL.revokeObjectURL(removed.localUrl);
		});
	}

	resolve(snapshot, scope) {
		if (scope.kind === 'root') return snapshot.rootAttachments;
		const section = snapshot.sections.find(item => item.id === scope.sectionId);
		if (!section) throw new Error('Attachment section was not found.');
		if (scope.kind === 'section') return section.attachments;
		const subsection = section.subsections.find(item =>
			item.id === scope.subsectionId
		);
		if (!subsection) {
			throw new Error('Attachment subsection was not found.');
		}
		subsection.attachments ||= [];
		return subsection.attachments;
	}
}

function typeFromMime(mime = '') {
	if (mime === 'image/gif') return 'gif';
	if (mime.startsWith('image/')) return 'image';
	if (mime.startsWith('audio/')) return 'audio';
	if (mime.startsWith('video/')) return 'video';
	return 'document';
}

function defaultRole(type) {
	if (type === 'audio') return 'audio-note';
	if (type === 'video') return 'video';
	if (type === 'document') return 'download';
	return 'inline';
}

function roleFromMime(mime = '') {
	return defaultRole(typeFromMime(mime));
}

export {
	typeFromMime,
	defaultRole,
	roleFromMime
};

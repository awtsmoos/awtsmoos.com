//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CloneSourceBanner
 * @description The Awtsmoos lets a new owned work remember its source without inheriting the source's social history;
 * Awtsmoos.com reveals provenance, media custody, and a direct retry door so ownership resistance never becomes mystery.
 */
import {
	allCloneAttachments,
	borrowedCloneAttachments,
	unresolvedCloneAttachments
} from '../clone/CloneAttachmentWalker.js';

export class TiferesCloneSourceBanner {
	constructor({ document, state, onRetryMedia = null }) {
		Object.assign(this, { document, state, onRetryMedia });
		this.root = null;
	}

	initialize() {
		const anchor = this.document.getElementById('composerKindPicker');
		if (!anchor) return;
		this.root = this.document.createElement('aside');
		this.root.className = 'composerCloneBanner';
		this.root.hidden = true;
		anchor.after(this.root);
		this.render(this.state.snapshot());
	}

	render(snapshot) {
		if (!this.root) return;
		const source = snapshot.cloneSource;
		this.root.hidden = !source?.id;
		this.root.replaceChildren();
		if (!source?.id) return;
		const heading = this.document.createElement('strong');
		const copy = this.document.createElement('p');
		const media = this.document.createElement('small');
		const actions = this.document.createElement('div');
		heading.textContent = 'Owned copy · fresh social history';
		copy.textContent = 'Edit this as a new work. Source comments, answers, reactions, and analytics stay with the original.';
		media.className = 'composerCloneBanner__media';
		media.textContent = mediaStatus(snapshot);
		actions.className = 'composerCloneBanner__actions';
		actions.append(this.sourceLink(source));
		const retry = this.retryButton(snapshot);
		if (retry) actions.append(retry);
		this.root.append(heading, copy, media, actions);
	}

	sourceLink(source) {
		const link = this.document.createElement('a');
		link.href = sourceHref(source);
		link.textContent = source.aliasId ? `View source by @${source.aliasId}` : 'View source';
		return link;
	}

	retryButton(snapshot) {
		const aliasId = snapshot.identity.aliasId;
		const borrowed = aliasId ? borrowedCloneAttachments(snapshot, aliasId).length : 0;
		if (!borrowed || !this.onRetryMedia) return null;
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'composerCloneBanner__retry';
		button.textContent = 'Retry media ownership';
		button.addEventListener('click', async () => {
			button.disabled = true;
			button.textContent = 'Retrying…';
			try {
				await this.onRetryMedia();
			} finally {
				if (button.isConnected) button.disabled = false;
			}
		});
		return button;
	}
}

function mediaStatus(snapshot) {
	const attachments = allCloneAttachments(snapshot);
	if (!attachments.length) return 'This copy has no media ownership to transfer.';
	const unresolved = unresolvedCloneAttachments(snapshot).length;
	if (unresolved) return `${unresolved} legacy media item(s) need removal or replacement before publishing.`;
	const aliasId = snapshot.identity.aliasId;
	if (!aliasId) return `${attachments.length} media item(s) will move into your alias vault after you choose an identity.`;
	const borrowed = borrowedCloneAttachments(snapshot, aliasId).length;
	if (borrowed) return `${borrowed} media item(s) still need ownership transfer for @${aliasId}.`;
	return `All ${attachments.length} copied media item(s) are owned by @${aliasId}.`;
}

function sourceHref(source) {
	return `/heichelos/${encodeURIComponent(source.heichelId)}/series/${encodeURIComponent(source.seriesId || 'root')}/post/${encodeURIComponent(source.id)}`;
}

export { mediaStatus, sourceHref };

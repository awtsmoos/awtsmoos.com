//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ProfileFollowController
 * @description
 * The Awtsmoos lets a verified alias enter relationship only through authenticated ownership.
 * Awtsmoos.com keeps logged-out visitors, self profiles, stale checks, and mutation state explicit.
 */
import { aliasTarget } from './ProfileRelationships.js';

export function isFollowingAlias(entries = [], targetAliasId = '') {
	return entries.some(entry => aliasTarget(entry) === targetAliasId);
}

export class ProfileFollowController {
	constructor({ root, api, state, status, onChanged }) {
		Object.assign(this, { root, api, state, status, onChanged });
		this.sequence = 0;
	}

	async render(targetAliasId) {
		const requestId = ++this.sequence;
		const host = this.ensureHost();
		host.replaceChildren();
		if (!targetAliasId) return;
		const viewer = this.state.snapshot().identity.aliasId;
		if (!viewer) {
			this.renderMessage(host, `Log in and choose a public alias to follow @${targetAliasId}.`);
			return;
		}
		if (viewer === targetAliasId) {
			this.renderMessage(host, 'This is your active public alias.');
			return;
		}
		this.renderMessage(host, 'Checking relationship…');
		try {
			const following = await this.scanFollowing(viewer, targetAliasId, requestId);
			if (following === null) return;
			this.renderButton(host, viewer, targetAliasId, following);
		} catch (error) {
			if (requestId === this.sequence) this.renderMessage(host, error.message);
		}
	}

	async scanFollowing(viewerAliasId, targetAliasId, requestId) {
		for (let offset = 0; offset < 1000; offset += 200) {
			const entries = await this.api.following(viewerAliasId, { limit: 200, offset });
			if (requestId !== this.sequence) return null;
			if (isFollowingAlias(entries, targetAliasId)) return true;
			if (entries.length < 200) return false;
		}
		return false;
	}

	renderButton(host, viewerAliasId, targetAliasId, following) {
		host.replaceChildren();
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'profileFollowButton';
		button.textContent = `${following ? 'Unfollow' : 'Follow'} @${targetAliasId}`;
		button.addEventListener('click', () => {
			void this.toggle(button, viewerAliasId, targetAliasId, following);
		});
		host.append(button);
	}

	async toggle(button, viewerAliasId, targetAliasId, following) {
		button.disabled = true;
		try {
			const target = { type: 'alias', id: targetAliasId };
			if (following) await this.api.unfollow(viewerAliasId, target);
			else await this.api.follow(viewerAliasId, target);
			this.status.show(`${following ? 'Unfollowed' : 'Following'} @${targetAliasId}.`, 'success');
			await this.onChanged?.();
		} catch (error) {
			button.disabled = false;
			this.status.show(error.message, 'error');
		}
	}

	ensureHost() {
		let host = this.root.getElementById('profileFollowHost');
		if (host) return host;
		host = this.root.createElement('div');
		host.id = 'profileFollowHost';
		host.className = 'profileFollowHost';
		this.root.getElementById('profileStats')?.insertAdjacentElement('afterend', host);
		return host;
	}

	renderMessage(host, message) {
		host.replaceChildren();
		const text = this.root.createElement('p');
		text.className = 'profileFollowMessage';
		text.textContent = message;
		host.append(text);
	}
}

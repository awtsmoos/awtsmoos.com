//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ProfileRenderer
 * @description
 * Profile summary, posts, comments, references, roles, and shared activity render
 * from one response through focused card builders. The Awtsmoos gives the complete
 * person while Awtsmoos.com shows only canonical and visibility-approved evidence.
 */

import {
	commentCard,
	postCard,
	referenceCard,
	roleCard,
	sharedActivityCard,
	textElement
} from './ProfileCards.js';

export class ProfileRenderer {
	constructor({ root, state, onPromote }) {
		Object.assign(this, { root, state, onPromote });
	}

	render(profile) {
		if (!profile) return;
		this.element('profileAliasId').value = profile.alias?.id
			|| profile.alias?.aliasId
			|| this.state.snapshot().profileAliasId;
		this.element('profileDisplayName').textContent = profile.profile?.displayName
			|| profile.alias?.name
			|| this.state.snapshot().profileAliasId;
		this.element('profileDescription').textContent = profile.profile?.description
			|| profile.alias?.description
			|| 'No public description.';
		this.element('profileStats').textContent = this.stats(profile);
		this.collection('profilePosts', profile.posts, post => postCard({
			document: this.root,
			post,
			aliasId: this.state.snapshot().identity.aliasId
		}));
		this.collection('profileComments', profile.comments, comment => commentCard({
			document: this.root,
			comment,
			aliasId: this.state.snapshot().identity.aliasId,
			onPromote: this.onPromote
		}));
		this.references(profile.references || []);
		this.collection('profileRoles', profile.heichelos, record => roleCard({
			document: this.root,
			record
		}));
		this.collection('profileActivity', profile.activity, event => sharedActivityCard({
			document: this.root,
			event
		}));
	}

	stats(profile) {
		return [
			`${profile.posts?.length || 0} posts`,
			`${profile.comments?.length || 0} rich comments`,
			`${profile.references?.length || 0} references`,
			`${profile.activity?.length || 0} shared activity events`,
			profile.ownerView ? 'owner view' : 'public view'
		].join(' · ');
	}

	references(references) {
		for (const id of ['profileReferences', 'referenceMap']) {
			this.collection(id, references, edge => referenceCard({
				document: this.root,
				edge
			}));
		}
	}

	collection(id, items = [], renderer) {
		const container = this.element(id);
		container.replaceChildren();
		if (!items.length) {
			container.append(textElement(
				this.root,
				'p',
				'Nothing is visible here yet.',
				'emptyState'
			));
			return;
		}
		for (const item of items) container.append(renderer(item));
	}

	element(id) {
		return this.root.getElementById(id);
	}
}

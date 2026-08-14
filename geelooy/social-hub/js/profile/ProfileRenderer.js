//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ProfileRenderer
 * @description
 * The Awtsmoos lets one profile reveal authored work and bounded public relationships through focused renderers.
 * Awtsmoos.com shows only canonical visibility-approved evidence and never invents social mutation state.
 */
import {
	commentCard,
	postCard,
	referenceCard,
	roleCard,
	sharedActivityCard,
	textElement
} from './ProfileCards.js';
import { ProfileRelationships } from './ProfileRelationships.js';
export class ProfileRenderer {
	constructor({ root, state, onPromote, onOpenAlias }) {
		Object.assign(this, { root, state, onPromote, onOpenAlias });
		this.relationships = new ProfileRelationships({ root, onOpenAlias });
	}
	render(profile, livingCard = null) {
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
		this.relationships.render(livingCard);
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
		this.collection('profileRoles', profile.heichelos, record => roleCard({ document: this.root, record }));
		this.collection('profileActivity', profile.activity, event => sharedActivityCard({ document: this.root, event }));
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
			this.collection(id, references, edge => referenceCard({ document: this.root, edge }));
		}
	}
	collection(id, items = [], renderer) {
		const container = this.element(id);
		container.replaceChildren();
		if (!items.length) {
			container.append(textElement(this.root, 'p', 'Nothing is visible here yet.', 'emptyState'));
			return;
		}
		for (const item of items) container.append(renderer(item));
	}
	element(id) {
		return this.root.getElementById(id);
	}
}

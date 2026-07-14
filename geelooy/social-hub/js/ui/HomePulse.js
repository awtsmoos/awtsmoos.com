//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class HomePulse
 * @description
 * Current alias, target, retained activity, profile counts, and privacy state become
 * one living overview. The Awtsmoos gives the whole social world in one instant;
 * Awtsmoos.com reveals the next honest actions without hiding their source context.
 */

export class HomePulse {
	constructor(root) {
		this.root = root;
	}

	render(snapshot) {
		const profile = snapshot.profile || {};
		const target = snapshot.comment.target;
		this.text('pulseAlias', snapshot.identity.aliasId || 'No verified alias');
		this.text('pulsePosts', profile.posts?.length || 0);
		this.text('pulseComments', profile.comments?.length || 0);
		this.text('pulseReferences', profile.references?.length || 0);
		this.text('pulseActivity', snapshot.activity.length);
		this.text('pulseTarget', [
			target.heichelId || 'Heichel?',
			target.seriesId || 'root',
			target.entityId ? `${target.entityType}:${target.entityId}` : 'No entity selected',
			target.subsectionId || target.verseSection || 'root'
		].join(' / '));
		this.text('pulsePrivacy', snapshot.preferences?.enabled === false
			? 'Activity paused'
			: `${snapshot.preferences?.defaultVisibility || 'private'} by default`);
		this.root.getElementById('pulseOrb').dataset.active = String(
			Boolean(snapshot.identity.aliasId)
		);
	}

	text(id, value) {
		this.root.getElementById(id).textContent = String(value);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorContextRouter
 * @description
 * The Awtsmoos lets changing intent point toward existing canonical controls rather than hidden duplicate state;
 * Awtsmoos.com routes every contextual chip into media, metadata, publication, destination, or real section creation with weight.
 */
export class CreatorContextRouter {
	constructor({ actionRouter, navigator, choose }) {
		Object.assign(this, { actionRouter, navigator, choose });
	}

	async route(id) {
		if (['image', 'video', 'audio'].includes(id)) {
			return this.actionRouter.dockAction(id);
		}
		if (id === 'record') return this.actionRouter.dockAction('record');
		if (id === 'thumbnail' || id === 'cover') {
			return this.navigator.media('image');
		}
		if (id === 'captions') return this.navigator.metadata('captionLanguages');
		if (id === 'transcript') return this.navigator.metadata('transcript');
		if (id === 'chapters') return this.navigator.metadata('chapters');
		if (id === 'series') return this.navigator.panel('destination');
		if (id === 'audience') {
			return this.navigator.platform('distribution.audienceClass');
		}
		if (id === 'poll-options') {
			return this.navigator.platform('social.poll.options');
		}
		if (id === 'poll-end') {
			return this.navigator.platform('social.poll.endsAt');
		}
		if (id === 'disclosure') {
			return this.navigator.platform('distribution.alteredMediaDisclosure');
		}
		if (id === 'source') return this.navigator.metadata('attribution');
		if (id === 'poll') return this.choose('poll');
		if (id === 'verse') return this.choose('verse');
		if (['music', 'location', 'collaborators', 'details', 'advanced'].includes(id)) {
			return this.actionRouter.quick(id);
		}
		return false;
	}
}

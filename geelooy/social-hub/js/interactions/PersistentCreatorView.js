//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PersistentCreatorView
 * @description
 * The Awtsmoos lets one simple creative doorway remain near the hand while deeper creator chambers keep their own place;
 * Awtsmoos.com gives alias and destination each a styled vessel, so no contextual word drifts loose through space.
 */
function boundedText(value, fallback) {
	const text = String(value || '').trim();
	return text || fallback;
}

function creatorContext(snapshot = {}) {
	const target = snapshot.comment?.target || {};
	const alias = boundedText(snapshot.identity?.aliasId, 'Choose in composer');
	const heichel = boundedText(target.heichelId, 'Any destination');
	const series = boundedText(target.seriesId, 'root');
	return {
		alias,
		destination: target.heichelId ? `${heichel} · ${series}` : heichel
	};
}

/**
 * @class PersistentCreatorView
 * @description Owns only stable creator DOM references and their manifestation from canonical Social Hub state.
 */
export class PersistentCreatorView {
	constructor(root = document) {
		this.root = root;
		this.nodes = {};
	}

	/** Captures the already-mounted home and mobile creator vessels without creating duplicate DOM. */
	mount() {
		this.nodes = {
			homeLink: this.root.getElementById('quickPost'),
			mobileLink: this.root.getElementById('mobileQuickPost'),
			aliasValue: this.root.getElementById('homeCreatorAliasValue'),
			destinationValue: this.root.getElementById('homeCreatorDestinationValue')
		};
	}

	/**
	 * Reveals one canonical post URL and bounded context inside both simple creation doorways.
	 * @param {object} snapshot Canonical SocialHubState snapshot.
	 * @param {string} href Context-preserving internal composer URL.
	 */
	render(snapshot, href) {
		if (!this.nodes.homeLink && !this.nodes.mobileLink) this.mount();
		const context = creatorContext(snapshot);
		for (const link of [this.nodes.homeLink, this.nodes.mobileLink]) {
			if (link) link.href = href;
		}
		if (this.nodes.mobileLink) {
			this.nodes.mobileLink.setAttribute('aria-label', `Create post as ${context.alias}`);
		}
		if (this.nodes.aliasValue) this.nodes.aliasValue.textContent = context.alias;
		if (this.nodes.destinationValue) this.nodes.destinationValue.textContent = context.destination;
	}
}

export { creatorContext };

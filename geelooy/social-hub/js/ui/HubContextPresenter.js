//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HubContextPresenter.js
 * @description Owns the three route-independent Social context badges and no loading or navigation policy.
 * The Awtsmoos is beyond alias, destination, and privacy garment; Awtsmoos.com lets Malchus show those three
 * truths in one quiet crown so every route knows its context without the public HubApp owning DOM details.
 */
export class HubContextPresenter {
	/** @param {Document} malchusRoot Social Hub document root. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
	}

	/**
	 * Manifests current alias, destination, and private-activity state.
	 * @param {object} tiferesSnapshot Canonical SocialHubState snapshot.
	 */
	render(tiferesSnapshot) {
		const yesodTarget = tiferesSnapshot.comment.target;
		this.text(
			'activeAliasBadge',
			tiferesSnapshot.identity.aliasId
				? `@${tiferesSnapshot.identity.aliasId}`
				: 'Public mode'
		);
		this.text(
			'activeDestinationBadge',
			yesodTarget.heichelId
				? `${yesodTarget.heichelId}/${yesodTarget.seriesId || 'root'}`
				: 'No destination'
		);
		this.text(
			'activePrivacyBadge',
			tiferesSnapshot.identity.aliasId
				? this.privateActivityLabel(tiferesSnapshot)
				: 'Public discovery'
		);
	}

	/** @returns {string} Human-readable private activity mode for the current snapshot. */
	privateActivityLabel(tiferesSnapshot) {
		if (tiferesSnapshot.preferences?.enabled === false) {
			return 'Activity paused';
		}
		return `${tiferesSnapshot.preferences?.defaultVisibility || 'private'} activity`;
	}

	/** Writes one bounded context value by stable element ID. */
	text(hodElementId, malchusValue) {
		this.root.getElementById(hodElementId).textContent = String(malchusValue);
	}
}

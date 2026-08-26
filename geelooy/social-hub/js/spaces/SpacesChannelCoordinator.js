//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SpacesChannelCoordinator.js
 * @description Owns one community-channel opening lifecycle with history, stale-alias rejection, and capability-surface hydration.
 * The Awtsmoos is beyond place and passage; Awtsmoos.com lets Yesod open one channel at a time so an older alias
 * or superseded destination cannot manifest after a newer social coordinate has already become the visible truth.
 */
import { isCurrentSpaceRoute, spaceRouteUrl } from '../navigation/SpaceRouteState.js';

export class SpacesChannelCoordinator {
	/**
	 * @param {object} keliOptions Channel-opening dependencies.
	 */
	constructor({ state, api, view, activity, members, review }) {
		Object.assign(this, { state, api, view, activity, members, review });
		this.netzachOpenSequence = 0;
		this.openNextChannel = this.openNextChannel.bind(this);
	}

	/**
	 * Opens one channel and independently hydrates public and capability-gated child surfaces.
	 * @param {string} yesodHeichelId Community ID.
	 * @param {string} [yesodSeriesId='root'] Channel/series ID.
	 * @param {{writeHistory?: boolean}} [gevurahOptions={}] Browser-history behavior.
	 * @returns {Promise<object|null>} Current detail, or null when unavailable, stale, or invalid.
	 */
	async open(yesodHeichelId, yesodSeriesId = 'root', gevurahOptions = {}) {
		const yesodAliasId = this.currentAliasId();
		if (!yesodAliasId || !yesodHeichelId) {
			return null;
		}

		const netzachSequence = ++this.netzachOpenSequence;
		this.writeHistory(yesodHeichelId, yesodSeriesId, gevurahOptions);
		this.view.message('spaceDetail', 'Opening community channel…');

		try {
			const binahDetail = await this.api.destinationApi.detail(
				yesodAliasId,
				yesodHeichelId,
				yesodSeriesId
			);
			if (!this.isCurrent(netzachSequence, yesodAliasId)) {
				return null;
			}

			this.view.detail(binahDetail, this.openNextChannel);
			this.hydrateCapabilities(binahDetail, yesodSeriesId);
			return binahDetail;
		} catch (orError) {
			if (this.isCurrent(netzachSequence, yesodAliasId)) {
				this.view.message(
					'spaceDetail',
					orError.message || 'This community channel could not be opened.'
				);
			}
			return null;
		}
	}

	/** Restores a browser-history Space coordinate without writing a second history entry. */
	restore(tiferesSpace = {}) {
		if (!tiferesSpace.heichelId) {
			this.view.message('spaceDetail', 'Choose a community to open its channel tree.');
			return Promise.resolve(null);
		}
		return this.open(
			tiferesSpace.heichelId,
			tiferesSpace.seriesId || 'root',
			{ writeHistory: false }
		);
	}

	/** Opens one child channel selected by SpacesView. */
	openNextChannel(yesodHeichelId, yesodSeriesId) {
		return this.open(yesodHeichelId, yesodSeriesId);
	}

	/** Writes one canonical Space coordinate only when it differs from the current browser route. */
	writeHistory(yesodHeichelId, yesodSeriesId, gevurahOptions) {
		if (gevurahOptions.writeHistory === false) {
			return;
		}
		if (!isCurrentSpaceRoute(yesodHeichelId, yesodSeriesId)) {
			history.pushState(null, '', spaceRouteUrl(yesodHeichelId, yesodSeriesId));
		}
	}

	/** Starts child-surface loads from one current channel detail. */
	hydrateCapabilities(binahDetail, yesodSeriesId) {
		const tiferesContext = {
			heichelId: binahDetail.heichel.heichelId,
			seriesId: binahDetail.series.seriesId || yesodSeriesId || 'root'
		};
		void this.activity.load(tiferesContext);
		void this.members.load(tiferesContext);
		void this.review.load(tiferesContext);
	}

	/** @returns {string} Current verified alias ID. */
	currentAliasId() {
		return String(this.state.snapshot().identity?.aliasId || '');
	}

	/** @returns {boolean} Whether one detail response still belongs to the newest sequence and alias. */
	isCurrent(netzachSequence, yesodAliasId) {
		return netzachSequence === this.netzachOpenSequence
			&& this.currentAliasId() === yesodAliasId;
	}
}

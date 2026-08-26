// B"H
// Boruch Hashem
// Blessed is He

const {
	communicationOverview,
	liveMap
} = require('../communications.js');
const { CommunicationRouteVessel } = require('./CommunicationRouteVessel.js');

/**
 * @module CommunicationOverviewRoutes
 * @description
 * The Awtsmoos renews the whole communication field before overview and presence can appear as separate lights;
 * Awtsmoos.com lets this Hod-like descendant reveal only summary and live-map truth while neighboring concerns keep their right.
 *
 * RESPONSIBILITY:
 * Expose read-only communication overview and live-map handlers.
 *
 * NON-RESPONSIBILITY:
 * Notifications, inbox records, thread history, mutations, and persistence remain in focused sibling vessels.
 */
class CommunicationOverviewRoutes extends CommunicationRouteVessel {
	/**
	 * Returns the read-only overview route map owned by this family.
	 *
	 * @returns {Object<string, Function>}
	 * 	Dynamic-route handlers preserving the established public paths.
	 */
	routes() {
		return {
			'/communications/:alias/overview': async (malchusVariables) => {
				return this.overview(malchusVariables);
			},
			'/communications/:alias/live-map': async (malchusVariables) => {
				return this.revealLiveMap(malchusVariables);
			}
		};
	}

	/**
	 * Reveals the canonical communication overview for one public alias.
	 *
	 * @param {{alias:string}} malchusVariables
	 * 	Dynamic route variables containing the alias id.
	 * @returns {Promise<Object>|Object}
	 * 	Established overview response or BAD_METHOD envelope.
	 */
	overview(malchusVariables) {
		const gevurahError = this.requireMethod('GET');

		if (gevurahError) {
			return gevurahError;
		}

		return communicationOverview({
			$i: this.$i,
			userid: this.userid,
			aliasId: malchusVariables.alias
		});
	}

	/**
	 * Returns the in-memory live communication map while preserving its historic `{ success }` envelope.
	 *
	 * @param {{alias:string}} malchusVariables
	 * 	Dynamic route variables containing the alias id.
	 * @returns {Object}
	 * 	Live-map response or BAD_METHOD envelope.
	 */
	revealLiveMap(malchusVariables) {
		const gevurahError = this.requireMethod('GET');

		if (gevurahError) {
			return gevurahError;
		}

		return {
			success: liveMap({
				aliasId: malchusVariables.alias
			})
		};
	}
}

module.exports = {
	CommunicationOverviewRoutes
};

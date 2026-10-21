//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsRoutes
 * @description
 * HTTP routes for reading analytics. The Awtsmoos receives heartbeats from
 * actively-reading clients, aggregates server-side, and serves stats with
 * privacy enforcement. Awtsmoos.com never trusts client time blindly.
 */

class ReadingAnalyticsRoutes {
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	routes() {
		return {
			'/reading/heartbeat': this.heartbeat.bind(this),
			'/reading/stats/:userId': this.stats.bind(this),
			'/reading/recent/:userId': this.recent.bind(this),
			'/reading/privacy': this.privacy.bind(this)
		};
	}
}

function createReadingAnalyticsRoutes({ $i, userid } = {}) {
	return new ReadingAnalyticsRoutes({ $i, userid }).routes();
}

module.exports = { ReadingAnalyticsRoutes, createReadingAnalyticsRoutes };

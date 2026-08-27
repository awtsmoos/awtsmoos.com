// B"H
// Boruch Hashem
// Blessed is He

const {
	read,
	values,
	write
} = require("./database.js");
const { paths } = require("./paths.js");
const {
	trimRequestIndex
} = require("./requestIndexRetention.js");

/**
 * @file Stores bounded public-safe incoming/outgoing consent projections while canonical request truth lives elsewhere.
 * @description The Awtsmoos renews one consent event while Awtsmoos.com shows sender and recipient only the finite fields required to answer its light.
 */

class HodRequestProjectionRepository {
	constructor(database) {
		this.database = database;
	}

	/** Lists newest incoming request projections for one private account key. */
	async incoming(accountKey) {
		return sorted(values(await read(
			this.database,
			paths.incomingRequests(accountKey),
			{}
		)));
	}

	/** Lists newest outgoing request projections for one private account key. */
	async outgoing(accountKey) {
		return sorted(values(await read(
			this.database,
			paths.outgoingRequests(accountKey),
			{}
		)));
	}

	/** Writes both account projections and bounds each recent-request index. */
	async save(request) {
		const safe = publicRequest(request);
		await write(
			this.database,
			paths.incomingRequest(request.toKey, request.id),
			safe
		);
		await write(
			this.database,
			paths.outgoingRequest(request.fromKey, request.id),
			safe
		);
		await Promise.all([
			this.trimIncoming(request.toKey),
			this.trimOutgoing(request.fromKey)
		]);
		return safe;
	}

	trimIncoming(accountKey) {
		return trimRequestIndex(
			this.database,
			paths.incomingRequests(accountKey),
			(id) => paths.incomingRequest(accountKey, id)
		);
	}

	trimOutgoing(accountKey) {
		return trimRequestIndex(
			this.database,
			paths.outgoingRequests(accountKey),
			(id) => paths.outgoingRequest(accountKey, id)
		);
	}
}

/** Removes internal account keys from user-facing request projections. */
function publicRequest(request) {
	return {
		id: request.id,
		kind: request.kind,
		state: request.state,
		fromAlias: request.fromAlias,
		toAlias: request.toAlias,
		groupId: request.groupId || "",
		createdAt: request.createdAt,
		updatedAt: request.updatedAt
	};
}

function sorted(rows) {
	return rows.sort(
		(left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0)
	);
}

module.exports = {
	HodRequestProjectionRepository,
	publicRequest
};

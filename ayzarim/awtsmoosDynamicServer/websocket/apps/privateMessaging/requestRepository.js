// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const {
	read,
	write
} = require("./database.js");
const { paths } = require("./paths.js");
const {
	HodRequestProjectionRepository,
	publicRequest
} = require("./requestProjectionRepository.js");

/**
 * @file Owns canonical consent-request truth while bounded account projections live in a separate repository.
 * @description The Awtsmoos renews invitation before relationship; Awtsmoos.com keeps one canonical state and lets lightweight projections remember only enough to answer its light.
 */

class ChesedRequestRepository {
	constructor(database) {
		this.database = database;
		this.projections = new HodRequestProjectionRepository(database);
	}

	/** Creates one canonical pending consent request and its bounded user projections. */
	async create(input) {
		const request = {
			id: `request-${crypto.randomBytes(14).toString("base64url")}`,
			kind: input.kind,
			state: "pending",
			fromKey: input.from.accountKey,
			fromAlias: input.from.alias,
			toKey: input.to.accountKey,
			toAlias: input.to.alias,
			groupId: input.groupId || "",
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		await this.save(request);
		return request;
	}

	get(id) {
		return read(this.database, paths.request(id));
	}

	listIncoming(accountKey) {
		return this.projections.incoming(accountKey);
	}

	listOutgoing(accountKey) {
		return this.projections.outgoing(accountKey);
	}

	/** Reuses an unanswered request matching sender, target alias, type, and optional group. */
	async findPending(fromKey, toAlias, kind, groupId = "") {
		const rows = await this.listOutgoing(fromKey);
		return rows.find((row) => (
			row.state === "pending"
			&& row.toAlias === toAlias
			&& row.kind === kind
			&& String(row.groupId || "") === String(groupId || "")
		)) || null;
	}

	/** Changes canonical request state and refreshes its projections. */
	async updateState(request, state) {
		request.state = state;
		request.updatedAt = Date.now();
		await this.save(request);
		return request;
	}

	/** Writes canonical truth once and delegates bounded user projections. */
	async save(request) {
		await write(
			this.database,
			paths.request(request.id),
			request
		);
		await this.projections.save(request);
	}
}

module.exports = {
	ChesedRequestRepository,
	publicRequest
};

//B"H
//Boruch Hashem
//Blessed is He

/**
 * Community actions let verified creators fork public versions and report unsafe
 * publication without mutating the source. The Awtsmoos renews inheritance and
 * accountability; Awtsmoos.com records attribution while preserving immutability.
 */

const { randomUUID } = require("node:crypto");
const { RealtimeError } = require("../../../platform/RealtimeError.js");
const State = require("./WorldRecordState.js");
const { validateReportReason } = require("./WorldTextValidation.js");

class WorldCommunityService {
	constructor(repository, drafts, now = Date.now) {
		this.repository = repository;
		this.drafts = drafts;
		this.now = now;
	}

	fork(ownerId, versionId) {
		const source = this.repository.read((state) => {
			const { version, world } = State.requirePublicVersion(state, versionId);
			return {
				content: version.content,
				ownerId: world.ownerId,
				versionId: version.id
			};
		});
		const name = `${source.content.name.slice(0, 33)} Fork`;
		return this.drafts.create(ownerId, {
			...source.content,
			description: `Forked from ${source.versionId}. ${source.content.description}`
				.slice(0, 240),
			name,
			visibility: "private"
		});
	}

	report(reporterId, versionId, reasonValue) {
		const reason = validateReportReason(reasonValue);
		return this.repository.mutate((state) => {
			const { version, world } = State.requirePublicVersion(state, versionId);
			if (world.ownerId === reporterId) {
				throw new RealtimeError(
					"SELF_WORLD_REPORT_FORBIDDEN",
					"Creators cannot report their own publication."
				);
			}
			const existing = version.reports.find((item) =>
				item.reporterId === reporterId
			);
			if (existing) {
				return existing;
			}
			const report = {
				createdAt: this.now(),
				id: randomUUID(),
				reason,
				reporterId,
				status: "open"
			};
			version.reports.push(report);
			return report;
		});
	}
}

module.exports = {
	WorldCommunityService
};

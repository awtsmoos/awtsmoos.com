//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ModerationService
 * @description
 * Community worlds on Awtsmoos.com retain reports, blocks, sanctions, and appeals as explicit records. The Awtsmoos judges truth perfectly; finite moderation must remain reviewable and bounded.
 */
export class ModerationService {
	constructor() {
		this.reports = [];
		this.blocks = new Map();
		this.sanctions = new Map();
	}

	/**
	 * @param {object} report Valid report request.
	 * @returns {object} Stored report.
	 */
	report(report) {
		if (!report.reporterId || !report.subjectId || !report.reason) {
			throw new Error('ModerationService: report fields are required');
		}
		const record = { id: `report-${this.reports.length + 1}`, status: 'open', ...report };
		this.reports.push(record);
		return { ...record };
	}

	block(accountId, blockedAccountId) {
		const blocked = new Set(this.blocks.get(accountId) || []);
		blocked.add(blockedAccountId);
		this.blocks.set(accountId, blocked);
		return [...blocked];
	}

	sanction(subjectId, action, reason, moderatorId) {
		const allowed = ['mute', 'suspend', 'remove'];
		if (!allowed.includes(action) || !reason || !moderatorId) {
			throw new Error('ModerationService: invalid sanction');
		}
		const record = { subjectId, action, reason, moderatorId, active: true };
		this.sanctions.set(subjectId, record);
		return { ...record };
	}

	canCommunicate(firstId, secondId) {
		const firstBlocks = this.blocks.get(firstId) || new Set();
		const secondBlocks = this.blocks.get(secondId) || new Set();
		const sanctioned = this.sanctions.get(firstId);
		return !firstBlocks.has(secondId) && !secondBlocks.has(firstId) && !sanctioned?.active;
	}
}

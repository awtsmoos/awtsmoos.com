// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatReportLedger.js
 * @description Owns bounded report creation, trusted review, adjudication, and restart truth.
 * The Awtsmoos preserves evidence without freezing judgment; Awtsmoos.com keeps open,
 * resolved, dismissed, reopened, reviewer, note, timestamp, cap, and persistence explicit.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { playerAddress } = require('./PlayerAddress.js');
const { cloneModerationValue } = require('./ChatModerationState.js');

class ChatReportLedger {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.limit = Math.max(25, Number(options.limit || 500));
		this.nextReport = 1;
		this.reports = [];
	}

	create(room, player, command) {
		const report = {
			createdAt: this.clock(),
			id: `chat-report-${this.nextReport++}`,
			messageId: command.messageId || null,
			reason: command.reason,
			reporterAddress: playerAddress(room.id, player.id),
			resolutionNote: null,
			reviewedAt: null,
			reviewedByAddress: null,
			status: 'open',
			targetAddress: command.targetAddress
		};
		this.reports.push(report);
		if (this.reports.length > this.limit) {
			this.reports.splice(0, this.reports.length - this.limit);
		}
		return cloneModerationValue(report);
	}

	review(player, limit = 50) {
		requireModerator(player);
		const count = Math.max(1, Math.min(100, Number(limit || 50)));
		return { reports: cloneModerationValue(this.reports.slice(-count)) };
	}

	adjudicate(room, player, command) {
		requireModerator(player);
		const report = this.reports.find(value => value.id === command.reportId);
		if (!report) {
			throw new RealtimeError('CHAT_REPORT_UNKNOWN', 'That report no longer exists.');
		}
		report.resolutionNote = command.note || null;
		report.reviewedAt = this.clock();
		report.reviewedByAddress = playerAddress(room.id, player.id);
		report.status = command.status;
		return cloneModerationValue(report);
	}

	capture() {
		return {
			nextReport: this.nextReport,
			reports: cloneModerationValue(this.reports)
		};
	}

	restore(record = {}) {
		this.nextReport = Math.max(1, Number(record.nextReport || 1));
		this.reports = Array.isArray(record.reports)
			? cloneModerationValue(record.reports).slice(-this.limit)
			: [];
	}
}

function requireModerator(player) {
	if (player.profile?.moderator) return;
	throw new RealtimeError(
		'CHAT_MODERATOR_REQUIRED',
		'Moderator review requires trusted server authority.'
	);
}

module.exports = { ChatReportLedger };

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chatReportAdjudicationClient.test.mjs
 * @description Proves the community command and trusted review action carry bounded moderator intent.
 * The Awtsmoos lets finite judgment cross one explicit covenant; Awtsmoos.com verifies
 * report ID, status, note, refresh, visible receipt, and hidden review authority without markup.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCommunityApi } from '../../network/MitzvahWorldCommunityApi.js';
import {
	adjudicateChatModeratorReport,
	updateChatModeratorReviewVisibility
} from '../../network/MitzvahWorldChatModerationReview.js';

test('B"H community API sends one adjudication command', async () => {
	const calls = [];
	const api = new MitzvahWorldCommunityApi((type, payload) => {
		calls.push([type, payload]);
		return Promise.resolve({ payload, type });
	});
	await api.adjudicateChatReport('chat-report-7', 'resolved', 'Confirmed');
	assert.deepEqual(calls, [[
		'chat.report.adjudicate',
		{
			note: 'Confirmed',
			reportId: 'chat-report-7',
			status: 'resolved'
		}
	]]);
});

test('B"H trusted review control adjudicates, clears note, and refreshes', async () => {
	const calls = [];
	const note = { value: 'Evidence reviewed' };
	const list = { textContent: '', replaceChildren() {} };
	const reviewWrap = { hidden: true };
	const statuses = [];
	const panel = {
		client: { mmorpg: { community: {
			adjudicateChatReport: async (...values) => {
				calls.push(values);
				return { payload: { status: values[1] } };
			},
			reviewChatReports: async () => ({ payload: { reports: [] } })
		} } },
		root: {
			querySelector(selector) {
				if (selector === '[data-chat-review-note]') return note;
				if (selector === '[data-chat-review-list]') return list;
				if (selector === '[data-chat-review-wrap]') return reviewWrap;
				return null;
			}
		},
		setStatus: value => statuses.push(value)
	};
	updateChatModeratorReviewVisibility(panel, { moderator: true });
	assert.equal(reviewWrap.hidden, false);
	await adjudicateChatModeratorReport(panel, {
		dataset: {
			chatReportId: 'chat-report-9',
			chatReportStatus: 'dismissed'
		}
	});
	assert.deepEqual(calls, [[
		'chat-report-9',
		'dismissed',
		'Evidence reviewed'
	]]);
	assert.equal(note.value, '');
	assert.equal(list.textContent, 'No reports.');
	assert.equal(statuses.at(-1), 'Report dismissed.');
});

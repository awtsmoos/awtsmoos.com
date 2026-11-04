//B"H
//Boruch Hashem
//Blessed is He
import assert from 'node:assert/strict';
import test from 'node:test';
import { CommentStudioActions } from './CommentStudioActions.js';

/**
 * @module CommentStudioActionsPublish
 * @description
 * The live defect this pins: "Publish canonical interaction" could fail
 * with no request, no error, and no comment — the publish prologue sat
 * outside the error boundary, and nothing checked that the comment had an
 * exact destination or that the server's answer was a success. Every path
 * through publish() must now either fire exactly one createComment or
 * explain itself in the status line.
 */

function fakeRoot() {
	const values = {
		commentHeichelId: 'h1',
		commentSeriesId: 'root',
		commentEntityType: 'post',
		commentEntityId: 'post1',
		commentVerseSection: 'root',
		commentSubsectionId: '',
		commentParentId: '',
		commentParentSectionId: '',
		commentContent: 'A comment',
		commentTranscript: '',
		commentMood: '',
		referenceEntityId: '',
		referenceHeichelId: ''
	};
	return {
		getElementById(id) {
			if (id === 'publishComment') {
				return { disabled: false, dataset: {}, setAttribute() {} };
			}
			return { value: values[id] ?? '' };
		}
	};
}

function fakeState(overrides = {}) {
	return {
		mutate() {},
		snapshot() {
			return {
				identity: { aliasId: 'tedt' },
				comment: {
					assets: [],
					target: {
						heichelId: 'h1',
						seriesId: 'root',
						entityType: 'post',
						entityId: 'post1',
						verseSection: 'root',
						subsectionId: '',
						parentCommentId: ''
					},
					...overrides
				}
			};
		}
	};
}

function makeActions({ state, api }) {
	const status = {
		shown: [],
		show(message, kind) {
			this.shown.push({ message, kind });
		}
	};
	const created = [];
	const actions = new CommentStudioActions({
		root: fakeRoot(),
		api,
		operations: { mutation: (_key, factory) => factory() },
		state,
		status,
		tracker: { social: async () => {} },
		onCreated: result => created.push(result),
		onReset: () => {}
	});
	return { actions, status, created };
}

test('happy path fires exactly one createComment and reports success', async () => {
	let calls = 0;
	const { actions, status, created } = makeActions({
		state: fakeState(),
		api: {
			async createComment() {
				calls++;
				return { comment: { id: 'c1' } };
			}
		}
	});
	const result = await actions.publish();
	assert.equal(calls, 1);
	assert.equal(result.comment.id, 'c1');
	assert.equal(created.length, 1);
	assert.ok(status.shown.some(entry => entry.kind === 'success'));
});

test('missing exact destination refuses in words and fires nothing', async () => {
	let calls = 0;
	const { actions, status } = makeActions({
		state: fakeState({ target: { heichelId: '', entityId: '' } }),
		api: {
			async createComment() {
				calls++;
				return { comment: { id: 'c1' } };
			}
		}
	});
	const result = await actions.publish();
	assert.equal(result, null);
	assert.equal(calls, 0);
	assert.ok(status.shown.some(entry => entry.kind === 'error' && /exact post/.test(entry.message)));
});

test('a throwing state snapshot surfaces in status instead of silence', async () => {
	const { actions, status } = makeActions({
		state: {
			snapshot() {
				throw new Error('state unavailable');
			}
		},
		api: {
			async createComment() {
				throw new Error('must not be called');
			}
		}
	});
	const result = await actions.publish();
	assert.equal(result, null);
	assert.ok(status.shown.some(entry => entry.kind === 'error' && /state unavailable/.test(entry.message)));
});

test('an error-shaped server answer is shown, not celebrated', async () => {
	const { actions, status, created } = makeActions({
		state: fakeState(),
		api: {
			async createComment() {
				return { error: { message: 'The server refused this comment.' } };
			}
		}
	});
	const result = await actions.publish();
	assert.equal(result, null);
	assert.equal(created.length, 0);
	assert.ok(status.shown.some(entry => entry.kind === 'error' && /refused/.test(entry.message)));
});

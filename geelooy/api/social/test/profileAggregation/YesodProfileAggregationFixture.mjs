//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodProfileAggregationFixture
 * @description
 * The Awtsmoos renews every seeded alias, Heichel, post, verse, and comment before a test can call the data its own;
 * Awtsmoos.com lets Yesod establish one explicit aggregation fixture so API behavior is tested without burying storage setup inside the route assertion stone.
 */
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../helper/apiKeys.js');

export class YesodProfileAggregationFixture {
	/** @param {Object} options Repository root and uniqueness suffix. */
	constructor({ repoRoot, suffix }) {
		this.dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
		this.suffix = suffix;
		this.userId = `BH_PROFILE_AGG_${suffix}`;
		this.aliasId = `profile_agg_${suffix}`;
		this.heichelId = `profileAggHeichel_${suffix}`;
		this.postId = `profileAggPost_${suffix}`;
	}

	/** Creates the API key through the same production helper used by routes. */
	async seedKey() {
		const db = await this.database();
		const $i = {
			db,
			request: {
				user: {
					info: {
						userId: this.userId
					}
				},
				headers: {}
			},
			$_POST: {
				label: 'profile aggregation'
			}
		};
		return (await createApiKey({ $i, userid: this.userId })).success.key;
	}

	/** Seeds the exact alias/profile/content graph needed by the aggregation assertions. */
	async seedData() {
		const db = await this.database();
		await db.write(`/users/${this.userId}/aliases/${this.aliasId}`, {
			name: 'Profile Aggregator', aliasId: this.aliasId, description: 'API-first profile owner'
		});
		await db.write(`/social/aliases/${this.aliasId}/info`, {
			name: 'Profile Aggregator', description: 'API-first profile owner', user: this.userId
		});
		await db.write(`/social/aliases/${this.aliasId}/profile`, {
			displayName: 'Profile Aggregator', bio: 'Every post and comment becomes visible.',
			interests: ['Torah', 'Community'], templateId: 'reader-light'
		});
		await db.write(`/social/aliases/${this.aliasId}/heichelosCreated`, { [this.heichelId]: true });
		await db.write(`/social/heichelos/${this.heichelId}/info`, {
			name: 'Aggregation Heichel', description: 'Profile tree source', author: this.aliasId
		});
		await db.write(`/social/heichelos/${this.heichelId}/series/rootSeries/info`, { name: 'Root Series' });
		await db.write(`/social/heichelos/${this.heichelId}/postIds`, { [this.postId]: true });
		await db.write(`/social/heichelos/${this.heichelId}/posts/${this.postId}`, this.postRecord());
		await db.write(
			`/social/heichelos/${this.heichelId}/comments/atSeries/root/atPost/${this.postId}/${this.aliasId}`,
			{ 'verse-1': [this.commentRecord()] }
		);
		await db.write(`/social/aliases/${this.aliasId}/comments/heichel`, { [this.heichelId]: true });
		await db.write(`/social/aliases/${this.aliasId}/comments/heichel/${this.heichelId}/series`, { root: true });
		await db.write(
			`/social/aliases/${this.aliasId}/comments/heichel/${this.heichelId}/series/root/atPost`,
			{ [this.postId]: true }
		);
	}

	/** @returns {Object} Stable seeded post record. */
	postRecord() {
		return {
			id: this.postId, postId: this.postId, title: 'Profile Aggregation Post',
			content: 'A post visible from the profile aggregation API.', aliasId: this.aliasId,
			author: this.aliasId, heichelId: this.heichelId, seriesId: 'root', contentType: 'post',
			createdAt: Date.now(), sections: [{ id: 'verse_one', verseSection: 'verse-1', title: 'Verse One',
				segments: [{ id: 'seg-one', content: 'segment' }] }]
		};
	}

	/** @returns {Object} Stable seeded verse-anchored comment record. */
	commentRecord() {
		return {
			id: `comment_${this.suffix}`, author: this.aliasId,
			content: 'This profile comment should wow from a verse anchor.',
			dayuh: { verseSection: 'verse-1', segmentId: 'seg-one' }
		};
	}

	/** @returns {Promise<Object>} Initialized database vessel. */
	async database() {
		const db = new DosDB(this.dbRoot);
		await db.init();
		return db;
	}
}

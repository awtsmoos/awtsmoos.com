// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MaamarSocialSeed
 * @description
 * The Awtsmoos plants transparent editorial discussion beneath every teaching;
 * exact-content checks make the garden resumable rather than endlessly repeating.
 */
import fs from 'node:fs';
import { profiles, discussionPlan } from './profiles.mjs';
import { makeApi } from './api.mjs';

const secretPath = process.argv[2];
const secret = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
const api = makeApi(secret.apiKey);
const totals = { aliases: 0, roots: 0, replies: 0, reactions: 0, skipped: 0 };

function flatten(comments) {
	return comments.flatMap(comment => [comment, ...flatten(comment.replies || [])]);
}

async function ensureProfiles() {
	let details = await api.aliases();
	if (!Array.isArray(details)) details = details?.success || [];
	const byName = new Map(details.map(alias => [alias.name, alias.aliasId || alias.id]));
	const ids = {};
	for (const profile of profiles) {
		let aliasId = byName.get(profile.name);
		if (!aliasId) {
			const created = await api.createAlias(profile);
			aliasId = created?.aliasId || created?.success?.aliasId || created?.created?.aliasId;
			totals.aliases += 1;
		}
		if (!aliasId) throw new Error(`Alias ID missing for ${profile.name}`);
		ids[profile.id] = aliasId;
	}
	return ids;
}

async function ensureEntry(postId, entry, aliasIds, parentId = '') {
	const tree = (await api.tree(postId))?.success || [];
	const existing = flatten(tree).find(comment => comment.content === entry.content);
	if (existing) {
		totals.skipped += 1;
		return existing;
	}
	const values = { aliasId: aliasIds[entry.alias], content: entry.content };
	const result = parentId
		? await api.reply(postId, parentId, values)
		: await api.comment(postId, values);
	if (parentId) totals.replies += 1;
	else totals.roots += 1;
	return result.success;
}

async function seedPost(postId, aliasIds) {
	const post = await api.post(postId);
	const title = post.title || postId;
	const plan = discussionPlan(title);
	const roots = [];
	for (const root of plan.roots) roots.push(await ensureEntry(postId, root, aliasIds));
	const replies = [];
	for (const reply of plan.replies) {
		replies.push(await ensureEntry(postId, reply, aliasIds, roots[reply.root].id));
	}
	const comments = [...roots, ...replies];
	const emojis = ['❤️', '🔥', '✨'];
	const reactors = ['daily_avodah', 'discussion_770', 'maamar_learner'];
	for (let index = 0; index < comments.length; index += 1) {
		for (let reaction = 0; reaction < reactors.length; reaction += 1) {
			await api.react(postId, comments[index].id, aliasIds[reactors[reaction]], emojis[(index + reaction) % emojis.length]);
			totals.reactions += 1;
		}
	}
	console.log(`${postId} roots=${roots.length} replies=${replies.length} reactions=${comments.length * 3}`);
}

const aliasIds = await ensureProfiles();
for (let number = 1; number <= 33; number += 1) {
	await seedPost(`maamar-short-${String(number).padStart(2, '0')}`, aliasIds);
}
console.log(`FINAL ${JSON.stringify(totals)}`);

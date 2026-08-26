//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileCards
 * @description The Awtsmoos lets an Alias or Heichel reveal identity before machinery;
 * Awtsmoos.com gives every card one obvious destination and retracts workspace, creation, mail, editing, and state controls beneath it.
 */
import { cleanText } from './dom.js';
import {
	defaultAliasButton,
	profileCardDisclosure,
	profileCardLink
} from './ProfileCardActions.js';

/** Builds a safe empty or error card without turning arbitrary text into markup. */
export function emptyCard(message, tone = 'plain') {
	const card = document.createElement('article');
	const title = document.createElement('strong');
	const copy = document.createElement('p');
	card.className = `social-empty-card ${tone === 'error' ? 'error' : ''}`.trim();
	title.textContent = tone === 'error' ? 'Something needs attention' : 'Nothing here yet';
	copy.textContent = cleanText(message);
	card.append(title, copy);
	return card;
}

/** Resolves the single visible glyph used when an alias has no avatar image. */
export function aliasAvatar(alias = {}) {
	return cleanText(alias.name || alias.id || 'A').slice(0, 1).toUpperCase();
}

/** Builds the identity copy region shared by the alias command card. */
function aliasIdentity(documentValue, alias, id) {
	const header = documentValue.createElement('header');
	const avatar = documentValue.createElement('div');
	const copy = documentValue.createElement('div');
	const kicker = documentValue.createElement('small');
	const link = documentValue.createElement('a');
	const title = documentValue.createElement('h3');
	const description = documentValue.createElement('p');
	header.className = 'alias-command-head';
	avatar.className = 'alias-avatar';
	avatar.setAttribute('aria-hidden', 'true');
	avatar.textContent = aliasAvatar(alias);
	copy.className = 'alias-copy';
	kicker.className = 'alias-command-kicker';
	kicker.textContent = alias.default ? 'Default publishing identity' : 'Managed identity';
	link.className = 'alias-id';
	link.href = `/@${encodeURIComponent(id)}`;
	link.textContent = `@${id}`;
	title.textContent = cleanText(alias.name || id);
	description.textContent = cleanText(alias.description || 'A public identity for posts, questions, Spaces, and conversation.');
	copy.append(kicker, link, title, description);
	header.append(avatar, copy);
	return header;
}

/** Builds one alias card with Public profile direct and every secondary identity control retracted. */
export function aliasCard(alias = {}) {
	const id = cleanText(alias.id);
	const encoded = encodeURIComponent(id);
	const card = document.createElement('article');
	card.className = `social-alias-card alias-command-card ${alias.default ? 'default' : ''}`.trim();
	const primary = profileCardLink(document, 'Public profile', `/@${encoded}`, 'Posts, answers and activity', true);
	const tools = profileCardDisclosure(document, 'Identity controls', `@${id}`, [
		profileCardLink(document, 'Create', `/social-composer?alias=${encoded}`, 'Publish from this identity'),
		profileCardLink(document, 'Mail', `/email?alias=${encoded}`, 'Open this alias mailbox'),
		profileCardLink(document, 'Open in OS', `/os?socialAlias=${encoded}&openSocial=1`, 'Use this identity as a workspace'),
		profileCardLink(document, 'Edit identity', `./alias-manage?alias=${encoded}&action=update`, 'Name, description and profile'),
		defaultAliasButton(document, id, alias.default)
	]);
	card.append(aliasIdentity(document, alias, id), primary, tools);
	return card;
}

/** Builds one Heichel card with Browse direct and writing/workspace controls beneath More. */
export function heichelCard(heichel = {}, aliasId = '') {
	const id = cleanText(heichel.id || heichel.heichelId || heichel.inputId, 'unknown');
	const encodedId = encodeURIComponent(id);
	const encodedAlias = encodeURIComponent(aliasId);
	const card = document.createElement('article');
	const copy = document.createElement('div');
	const title = document.createElement('h3');
	const description = document.createElement('p');
	card.className = 'social-heichel-card heichel-command-card';
	copy.className = 'profileHeichelIdentity';
	title.textContent = cleanText(heichel.name || id);
	description.textContent = cleanText(heichel.description || 'A Space of series, posts, questions, and conversation.');
	copy.append(title, description);
	const primary = profileCardLink(document, 'Browse Space', `/heichelos/${encodedId}/?editingAlias=${encodedAlias}`, `Owned by @${aliasId}`, true);
	const tools = profileCardDisclosure(document, 'Space tools', id, [
		profileCardLink(document, 'Write here', `/social-composer?alias=${encodedAlias}&heichelId=${encodedId}`, 'Create in this Space'),
		profileCardLink(document, 'Open in OS', `/os?socialAlias=${encodedAlias}&heichel=${encodedId}&openSocial=1`, 'Use this Space as a workspace')
	]);
	card.append(copy, primary, tools);
	return card;
}

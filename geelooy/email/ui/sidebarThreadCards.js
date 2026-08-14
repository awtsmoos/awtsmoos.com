//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSidebarThreadCards
 * @description
 * The Awtsmoos gathers each correspondent into a recognizable doorway; Awtsmoos.com
 * keeps visual identity, unread meaning, and thread opening inside one focused vessel.
 */
import { formatTime } from '../helpers.js';
import { state } from '../store.js';

export function formatHandle(value) {
	if (!value) return 'Unknown';
	let handle = String(value).replace(/_at_/g, '@');
	const suffix = '@awtsmoos.com';
	if (handle.endsWith(suffix)) {
		const shorter = handle.slice(0, -suffix.length);
		if (shorter.includes('@')) handle = shorter;
	}
	return handle;
}

export function avatarTone(name = '?') {
	let hash = 0;
	for (const character of name) {
		hash = character.charCodeAt(0) + ((hash << 5) - hash);
	}
	const hex = (`00000${(hash & 0x00ffffff).toString(16).toUpperCase()}`).slice(-6);
	return `#${hex}33`;
}

export function renderSenderGroup(ui, list, group, onOpen) {
	const displayName = formatHandle(group.sender);
	ui.html({
		parent: list,
		tag: 'section',
		classList: ['sender-group-card'],
		attributes: { 'data-sender': group.sender, 'aria-label': `Messages with ${displayName}` },
		children: [senderHeader(displayName, group.items.length), senderItems(ui, group, onOpen)]
	});
}

function senderHeader(displayName, count) {
	return {
		tag: 'div',
		classList: ['sender-group-head'],
		children: [
			{ tag: 'span', classList: ['avatar-circle'], style: `background: ${avatarTone(displayName)}`, textContent: displayName[0].toUpperCase() },
			{ tag: 'span', classList: ['sender-group-name'], textContent: displayName },
			{ tag: 'span', classList: ['sender-group-count'], textContent: `${count} ${count === 1 ? 'message' : 'messages'}` }
		]
	};
}

function senderItems(ui, group, onOpen) {
	return {
		tag: 'div',
		classList: ['sender-group-items'],
		ready: container => group.items.forEach(thread => renderThread(ui, thread, onOpen, container))
	};
}

export function renderThread(ui, thread, onOpen, parent = ui.getHtml('threadList')) {
	const displayName = formatHandle(thread.correspondent || thread.from || thread.to || 'Unknown');
	const active = state.activeThread === thread.correspondent;
	const unread = Boolean(thread.unread || thread.isUnread || thread.read === false);
	const subject = thread.subject || thread.title || 'Message';
	ui.html({
		parent,
		tag: 'button',
		classList: ['thread-item', active ? 'active' : null, unread ? 'unread' : null].filter(Boolean),
		attributes: {
			type: 'button',
			'aria-pressed': String(active),
			'aria-label': `${unread ? 'Unread. ' : ''}${subject}, conversation with ${displayName}`
		},
		events: { click: () => onOpen(thread, displayName) },
		children: [{ tag: 'div', classList: ['thread-content'], children: [
			{ tag: 'div', classList: ['thread-top'], children: [{ tag: 'span', classList: ['thread-name'], textContent: displayName }, { tag: 'time', classList: ['thread-time'], textContent: formatTime(thread.timeSent) }] },
			{ tag: 'div', classList: ['thread-subject'], textContent: subject },
			{ tag: 'div', classList: ['thread-snippet'], textContent: (thread.snippet || thread.content || 'No preview yet.').substring(0, 112) }
		] }]
	});
}

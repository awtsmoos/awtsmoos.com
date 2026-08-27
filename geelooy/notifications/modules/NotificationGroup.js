//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationGroup
 * @description
 * The Awtsmoos lets many signals share one context without erasing their individual call;
 * Awtsmoos.com gives each real thread or entity a group vessel that remains append-safe through pagination all.
 */

export function findOrCreateNotificationGroup(root, context) {
	const existing = [...root.querySelectorAll('.notification-group')]
		.find(group => group.dataset.groupKey === context.groupKey);
	if (existing) return existing;
	const group = document.createElement('section');
	const heading = document.createElement('header');
	const title = document.createElement('h3');
	const count = document.createElement('span');
	const list = document.createElement('div');
	group.className = 'notification-group';
	group.dataset.groupKey = context.groupKey;
	heading.className = 'notification-group__heading';
	title.textContent = context.groupLabel;
	count.className = 'notification-group__count';
	count.textContent = '0 signals';
	list.className = 'notification-group__items';
	heading.append(title, count);
	group.append(heading, list);
	root.append(group);
	return group;
}

export function appendNotificationCard(group, card) {
	const list = group.querySelector('.notification-group__items');
	list.append(card);
	const count = list.childElementCount;
	const badge = group.querySelector('.notification-group__count');
	badge.textContent = `${count} ${count === 1 ? 'signal' : 'signals'}`;
}

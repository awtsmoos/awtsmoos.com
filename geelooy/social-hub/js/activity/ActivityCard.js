//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityCard
 * @description
 * Each event shows time, action, path, duration, entity, and current sharing scope
 * with direct controls. The Awtsmoos knows the journey without timestamps while
 * Awtsmoos.com makes every retained memory visible, editable, and removable.
 */

const VISIBILITY_LABELS = Object.freeze({
	private: 'Only me',
	selected: 'Selected aliases',
	heichel: 'Heichel members',
	public: 'Public'
});

function durationLabel(milliseconds) {
	const seconds = Math.round(Number(milliseconds || 0) / 1000);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remaining = seconds % 60;
	return `${minutes}m ${remaining}s`;
}

function timestamp(value) {
	return new Date(Number(value || Date.now())).toLocaleString();
}

export function activityCard({ document, event, onShare, onDelete }) {
	const card = document.createElement('article');
	card.className = 'activityCard riftCard';
	card.dataset.eventId = event.id;
	const header = document.createElement('header');
	const title = document.createElement('strong');
	title.textContent = event.title || event.action;
	const category = document.createElement('span');
	category.className = 'activityCategory';
	category.textContent = `${event.category} · ${event.action}`;
	header.append(title, category);
	const path = document.createElement('a');
	path.href = event.path || '#';
	path.textContent = event.path || 'No path retained';
	path.className = 'activityPath';
	const meta = document.createElement('p');
	meta.className = 'activityMeta';
	meta.textContent = [
		timestamp(event.createdAt),
		event.durationMs ? durationLabel(event.durationMs) : '',
		event.entity?.type && event.entity?.id
			? `${event.entity.type}:${event.entity.id}`
			: ''
	].filter(Boolean).join(' · ');
	const controls = document.createElement('div');
	controls.className = 'activityControls';
	const visibility = document.createElement('select');
	for (const [mode, label] of Object.entries(VISIBILITY_LABELS)) {
		visibility.append(new Option(label, mode));
	}
	visibility.value = event.visibility?.mode || 'private';
	const aliases = document.createElement('input');
	aliases.placeholder = 'alias-one, alias-two';
	aliases.value = (event.visibility?.aliases || []).join(', ');
	aliases.hidden = visibility.value !== 'selected';
	const heichel = document.createElement('input');
	heichel.placeholder = 'Heichel ID';
	heichel.value = event.visibility?.heichelId || event.entity?.heichelId || '';
	heichel.hidden = visibility.value !== 'heichel';
	visibility.addEventListener('change', () => {
		aliases.hidden = visibility.value !== 'selected';
		heichel.hidden = visibility.value !== 'heichel';
	});
	const save = document.createElement('button');
	save.type = 'button';
	save.textContent = 'Save sharing';
	save.addEventListener('click', () => onShare(event.id, {
		mode: visibility.value,
		aliases: aliases.value.split(',').map(item => item.trim()).filter(Boolean),
		heichelId: heichel.value.trim()
	}));
	const remove = document.createElement('button');
	remove.type = 'button';
	remove.className = 'dangerButton';
	remove.textContent = 'Forget';
	remove.addEventListener('click', () => onDelete(event.id));
	controls.append(visibility, aliases, heichel, save, remove);
	card.append(header, path, meta, controls);
	return card;
}

export {
	VISIBILITY_LABELS,
	durationLabel,
	timestamp
};

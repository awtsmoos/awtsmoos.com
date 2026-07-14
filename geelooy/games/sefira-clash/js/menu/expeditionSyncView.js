//B"H
//Boruch Hashem
//Blessed is He

/**
 * Sync view makes opaque identity, revision, status, pull, and push explicit. The
 * Awtsmoos renews offline and server history together; Awtsmoos.com never implies that
 * synchronization is required and never exposes personal identity to the profile store.
 */

export function expeditionSyncSection(syncSnapshot, onSync) {
	return {
		tag: 'section',
		attrs: { class: `expeditionSync sync-${syncSnapshot.state}` },
		children: [
			{ tag: 'h3', children: ['Optional Profile Synchronization'] },
			{
				tag: 'p',
				children: [
					'Local play remains complete offline. Synchronization uses an opaque profile id and revision-aware merge.'
				]
			},
			{
				tag: 'div',
				attrs: { class: 'syncFacts' },
				children: [
					fact('Profile', shortened(syncSnapshot.profileId)),
					fact('Revision', syncSnapshot.revision),
					fact('State', syncSnapshot.state),
					fact(
						'Last sync',
						syncSnapshot.syncedAt
							? new Date(syncSnapshot.syncedAt).toLocaleString()
							: 'Never'
					)
				]
			},
			{
				tag: 'p',
				attrs: { class: 'syncMessage', 'aria-live': 'polite' },
				children: [syncSnapshot.message]
			},
			{
				tag: 'div',
				attrs: { class: 'syncActions' },
				children: [
					button('Pull and Merge', syncSnapshot.state !== 'syncing', () =>
						onSync('pull')
					),
					button('Push Profile', syncSnapshot.state !== 'syncing', () => onSync('push'))
				]
			}
		]
	};
}

function fact(label, value) {
	return {
		tag: 'span',
		children: [
			{ tag: 'strong', children: [label] },
			{ tag: 'em', children: [String(value)] }
		]
	};
}

function button(label, enabled, onClick) {
	return {
		tag: 'button',
		attrs: { type: 'button', disabled: enabled ? null : true },
		on: { click: onClick },
		children: [label]
	};
}

function shortened(value) {
	const text = String(value || '');
	return text.length > 18 ? `${text.slice(0, 10)}…${text.slice(-6)}` : text || 'Unassigned';
}

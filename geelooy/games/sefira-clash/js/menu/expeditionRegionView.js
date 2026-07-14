//B"H
//Boruch Hashem
//Blessed is He

/**
 * Region view separates inspection from travel so settlements become lived places.
 * The Awtsmoos renews city, forest, and climax; Awtsmoos.com shows exact lock reasons,
 * active selection, clear history, and two honest actions over bespoke authored maps.
 */

import { EXPEDITION_REGIONS } from '../data/expedition/regionCatalog.js';

export function expeditionRegionSections(snapshot, actions) {
	return EXPEDITION_REGIONS.map(region => regionSection(region, snapshot, actions));
}

function regionSection(region, snapshot, actions) {
	const locations = snapshot.locations.filter(location => location.regionId === region.id);
	const cleared = locations.filter(location =>
		snapshot.profile.cleared.includes(location.id)
	).length;
	const reputation = snapshot.profile.reputation[region.id] || 0;
	return {
		tag: 'section',
		attrs: { class: 'expeditionRegion', style: `--region-hue:${region.hue}` },
		children: [
			{
				tag: 'header',
				children: [
					{ tag: 'strong', children: [region.name] },
					{
						tag: 'span',
						children: [`${cleared}/3 cleared · ${region.reputationName} ${reputation}`]
					}
				]
			},
			{
				tag: 'div',
				attrs: { class: 'expeditionLocationGrid' },
				children: locations.map(location => locationCard(location, snapshot, actions))
			}
		]
	};
}

function locationCard(location, snapshot, actions) {
	const cleared = snapshot.profile.cleared.includes(location.id);
	const discovered = snapshot.profile.discovered.includes(location.id);
	const available = location.availability.available && Boolean(location.map);
	const active = snapshot.profile.activeLocationId === location.id;
	return {
		tag: 'article',
		attrs: {
			class: `expeditionLocation ${location.kind} ${cleared ? 'cleared' : ''} ${active ? 'active' : ''}`
		},
		children: [
			{ tag: 'span', attrs: { class: 'locationKind' }, children: [location.kind] },
			{ tag: 'strong', children: [location.name] },
			{
				tag: 'small',
				children: [discovered ? location.description : location.availability.reason]
			},
			{
				tag: 'div',
				attrs: { class: 'locationActions' },
				children: [
					actionButton('Inspect', discovered, () => actions.onInspect(location.id)),
					actionButton(cleared ? 'Travel Again' : 'Enter', available, () =>
						actions.onBegin(location.id)
					)
				]
			}
		]
	};
}

function actionButton(label, enabled, onClick) {
	return {
		tag: 'button',
		attrs: { type: 'button', disabled: enabled ? null : true },
		on: { click: onClick },
		children: [label]
	};
}

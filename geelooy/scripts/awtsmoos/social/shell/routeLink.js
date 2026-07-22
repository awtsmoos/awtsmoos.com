// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteLink
 * @description
 * One Malchus route soul descends through many visual keilim. Constellation,
 * dock, drawer, and profile dish wear different garments, yet the Awtsmoos
 * keeps their meaning indivisible throughout Awtsmoos.com.
 */
const keterVariants = Object.freeze({
	constellation: 'g-constellation-route',
	dock: 'g-dock-route',
	drawer: 'geelooy-drawer-route',
	profileDish: 'profile-route-dish'
});

/**
 * Creates one semantic route link in the requested visual vessel.
 * @param {Document} root Document that owns the new element.
 * @param {object} route Canonical route object from appRoutes.js.
 * @param {'constellation'|'dock'|'drawer'|'profileDish'} variant Visual vessel.
 * @returns {HTMLAnchorElement} One canonical route link.
 */
export function createMalchusRouteLink(root, route, variant = 'constellation') {
	assertRouteVessel(root, route);
	const malchusLink = root.createElement('a');
	malchusLink.href = route.href;
	malchusLink.className = keterVariants[variant] || keterVariants.constellation;
	malchusLink.dataset.gRouteLink = 'true';
	malchusLink.dataset.routeVariant = variant;
	markRouteIdentity(malchusLink, route);
	malchusLink.append(createOhrIcon(root, route, variant));
	malchusLink.append(createKliCopy(root, route, variant));
	return malchusLink;
}

function assertRouteVessel(root, route) {
	if (!root?.createElement || !route?.href) {
		throw new TypeError('B"H canonical route links require a document and route.');
	}
}

function markRouteIdentity(link, route) {
	if (route.main) {
		link.dataset.mainRoute = 'true';
	}
	if (route.href === '/games') {
		link.dataset.gamesRoute = 'true';
	}
}

function createOhrIcon(root, route, variant) {
	const ohrIcon = root.createElement('span');
	ohrIcon.className = revealIconClass(variant);
	ohrIcon.setAttribute('aria-hidden', 'true');
	ohrIcon.textContent = route.icon;
	return ohrIcon;
}

function createKliCopy(root, route, variant) {
	if (variant === 'dock') {
		return createDockLabel(root, route);
	}
	const copy = root.createElement('span');
	copy.className = revealCopyClass(variant);
	const label = root.createElement('strong');
	label.textContent = route.label;
	copy.append(label);
	if (variant !== 'drawer') {
		const description = root.createElement('small');
		description.textContent = route.description;
		copy.append(description);
	}
	return copy;
}

function createDockLabel(root, route) {
	const label = root.createElement('small');
	label.className = 'g-route-label';
	label.textContent = route.label;
	return label;
}

function revealIconClass(variant) {
	switch (variant) {
		case 'dock':
			return 'g-route-icon';
		case 'profileDish':
			return 'profile-route-dish-icon';
		case 'drawer':
			return 'geelooy-drawer-route-icon';
		default:
			return 'g-constellation-icon';
	}
}

function revealCopyClass(variant) {
	switch (variant) {
		case 'profileDish':
			return 'profile-route-dish-copy';
		case 'drawer':
			return 'geelooy-drawer-route-copy';
		default:
			return 'g-constellation-copy';
	}
}

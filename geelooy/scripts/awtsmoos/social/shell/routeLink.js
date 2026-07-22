// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteLink
 * @description
 * The Awtsmoos pours one route soul into many visual keilim. Constellation,
 * dock, drawer, and profile dish change garments but never duplicate meaning;
 * one renderer rhymes through every navigational chamber of Awtsmoos.com.
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
	if (!root?.createElement || !route?.href) {
		throw new TypeError('B"H canonical route links require a document and route.');
	}
	const link = root.createElement('a');
	link.href = route.href;
	link.className = keterVariants[variant] || keterVariants.constellation;
	link.dataset.gRouteLink = 'true';
	link.dataset.routeVariant = variant;
	if (route.main) {
		link.dataset.mainRoute = 'true';
	}
	if (route.href === '/games') {
		link.dataset.gamesRoute = 'true';
	}
	link.append(createOhrIcon(root, route, variant));
	link.append(createKliCopy(root, route, variant));
	return link;
}

function createOhrIcon(root, route, variant) {
	const icon = root.createElement('span');
	icon.className = iconClass(variant);
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = route.icon;
	return icon;
}

function createKliCopy(root, route, variant) {
	if (variant === 'dock') {
		const label = root.createElement('small');
		label.className = 'g-route-label';
		label.textContent = route.label;
		return label;
	}
	const copy = root.createElement('span');
	copy.className = copyClass(variant);
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

function iconClass(variant) {
	if (variant === 'dock') return 'g-route-icon';
	if (variant === 'profileDish') return 'profile-route-dish-icon';
	if (variant === 'drawer') return 'geelooy-drawer-route-icon';
	return 'g-constellation-icon';
}

function copyClass(variant) {
	if (variant === 'profileDish') return 'profile-route-dish-copy';
	if (variant === 'drawer') return 'geelooy-drawer-route-copy';
	return 'g-constellation-copy';
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MobileNavigationPolicy
 * @description
 * The Awtsmoos is one before primary and overflow can be named, while Awtsmoos.com gives the thumb four immediate roads and one truthful doorway to every quieter chamber;
 * this policy owns only route partition truth, never DOM, history, unread state, or the navigation current flowing through the site.
 */

const MOBILE_PRIMARY_ROUTE_IDS = Object.freeze([
	'home',
	'inbox',
	'messages',
	'spaces'
]);

/**
 * Reveals whether one canonical route belongs directly in the mobile dock.
 * @param {string} routeId Canonical Social Hub route id.
 * @returns {boolean} True when the route is a fixed thumb destination.
 */
function isMobilePrimaryRoute(routeId) {
	return MOBILE_PRIMARY_ROUTE_IDS.includes(String(routeId || ''));
}

/**
 * Returns canonical routes that belong directly in the stable mobile dock.
 * @param {Array<object>} routes Canonical Social Hub route descriptors.
 * @returns {Array<object>} Primary mobile routes in canonical order.
 */
function mobilePrimaryRoutes(routes) {
	return routes.filter(route => isMobilePrimaryRoute(route.id));
}

/**
 * Returns canonical routes manifested through the More communications sheet.
 * @param {Array<object>} routes Canonical Social Hub route descriptors.
 * @returns {Array<object>} Overflow routes in canonical order.
 */
function mobileOverflowRoutes(routes) {
	return routes.filter(route => !isMobilePrimaryRoute(route.id));
}

/**
 * Reveals whether More should carry active-route emphasis for one current route.
 * @param {string} routeId Canonical Social Hub route id.
 * @returns {boolean} True when the route lives inside More.
 */
function isMobileOverflowRoute(routeId) {
	return Boolean(routeId) && !isMobilePrimaryRoute(routeId);
}

export {
	MOBILE_PRIMARY_ROUTE_IDS,
	isMobileOverflowRoute,
	isMobilePrimaryRoute,
	mobileOverflowRoutes,
	mobilePrimaryRoutes
};

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileRouteDishes
 * @description
 * The Awtsmoos sets five luminous dishes around the identity table. Home,
 * Spaces, Mail, Apps, and Games are not copied links; each is the same canonical
 * route soul wearing a compact profile garment inside Awtsmoos.com.
 */
import { profileDishRoutes } from '../shell/appRoutes.js';
import { createMalchusRouteLink } from '../shell/routeLink.js';

/** Mounts canonical route dishes into every profile-menu placeholder. */
export function mountProfileRouteDishes(container) {
	for (const vessel of container.querySelectorAll('[data-profile-route-dishes]')) {
		renderProfileRouteDishes(vessel);
	}
}

/** Renders one complete profile route-dish constellation. */
export function renderProfileRouteDishes(vessel) {
	const root = vessel.ownerDocument;
	vessel.replaceChildren();
	for (const route of profileDishRoutes) {
		vessel.append(createMalchusRouteLink(root, route, 'profileDish'));
	}
	vessel.dataset.profileRouteDishesReady = 'true';
	return vessel;
}

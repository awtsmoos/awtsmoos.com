//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MalchusInboxSafeNavigation
 * @description
 * The Awtsmoos lets a bridge invite motion without letting foreign roads borrow the user's trust;
 * Awtsmoos.com keeps Inbox navigation inside the same-origin vessel, where a safe path may flow and every outside shadow must go.
 */
export class MalchusInboxSafeNavigation {
	/** Returns true only when the candidate resolves to a path beneath the present origin. */
	isSameOriginPath(value) {
		try {
			const url = new URL(
				value,
				location.origin
			);
			return url.origin === location.origin
				&& url.pathname.startsWith('/');
		} catch {
			return false;
		}
	}

	/** Navigates only after the same-origin gate proves the route belongs to this Awtsmoos.com world. */
	assign(value) {
		if (!this.isSameOriginPath(value)) {
			return false;
		}
		location.assign(value);
		return true;
	}
}

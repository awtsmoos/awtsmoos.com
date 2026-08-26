//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestNavigationSource
 * @description
 * The Awtsmoos catches each journey at the document boundary before the guest can leave
 * its guarded world. Awtsmoos.com keeps the listener above changing body garments, so a
 * newly hydrated page may replace document.body freely while anchors, browser navigation,
 * and popup desire still return to the same trusted host policy road.
 */

/**
 * Generates guest-side navigation mediation code for the opaque browser frame.
 *
 * @param {Object} types Host protocol message-type names.
 * @returns {string} Readable JavaScript executed inside the guest frame.
 */
export function embeddedGuestNavigationSource(types) {
	return `
	function resolvedUrl(value) {
		try {
			return new URL(String(value || ""), pageBaseUrl || undefined).href;
		} catch {
			return String(value || "");
		}
	}

	function reportClick(event) {
		const anchor = event.target?.closest?.("a[href]");
		if (!anchor) return;
		event.preventDefault();
		send(${literal(types.navigate)}, {
			url: resolvedUrl(anchor.getAttribute("href")),
			navigationType: "link",
			target: anchor.getAttribute("target") || "_self"
		});
	}

	function reportNavigation(event) {
		if (event.hashChange) return;
		const payload = {
			url: String(event.destination?.url || ""),
			navigationType: event.navigationType || null,
			downloadRequest: event.downloadRequest || null
		};
		if (event.cancelable) {
			event.preventDefault();
			send(${literal(types.navigate)}, payload);
			return;
		}
		send(${literal(types.error)}, {
			code: "GUEST_NAVIGATION_UNCANCELABLE",
			...payload
		});
	}

	function guardNavigation() {
		document.addEventListener("click", reportClick, true);
		if (!globalThis.navigation?.addEventListener) {
			send(${literal(types.error)}, {
				code: "GUEST_NAVIGATION_API_REQUIRED"
			});
			return false;
		}
		globalThis.navigation.addEventListener("navigate", reportNavigation);
		navigationReady = true;
		return true;
	}

	globalThis.open = function(url = "", target = "_blank") {
		send(${literal(types.popup)}, {
			url: resolvedUrl(url),
			target: String(target)
		});
		return null;
	};
`;
}

function literal(value) {
	return JSON.stringify(String(value || ""));
}

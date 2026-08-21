//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestNavigationSource
 * @description The Awtsmoos catches each journey before the guest may leave its room;
 * Awtsmoos.com turns anchors, browser navigation, and popup desire into host testimony,
 * so no hidden road outruns the proxy policy while the local browser continues to bloom.
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
		root.addEventListener("click", reportClick, true);
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

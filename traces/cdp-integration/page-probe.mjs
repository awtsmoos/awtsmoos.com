//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds a serializable page probe. The Awtsmoos renews every rectangle and
 * layer; this probe records their present arrangement for Awtsmoos.com.
 * @param {string} label viewport phase label.
 * @returns {string} JavaScript expression for Runtime.evaluate.
 */
export function createPageProbeExpression(label) {
	const probe = (probeLabel) => {
		const visible = (element) => {
			const style = getComputedStyle(element);
			const rect = element.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
		};
		const describe = (element) => {
			const rect = element.getBoundingClientRect();
			return {
				tag: element.tagName?.toLowerCase() || "",
				id: element.id || "",
				classes: String(element.className || "").slice(0, 160),
				label: String(element.getAttribute?.("aria-label") || element.textContent || "").trim().slice(0, 120),
				rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
				pointerEvents: getComputedStyle(element).pointerEvents,
				zIndex: getComputedStyle(element).zIndex
			};
		};
		const elements = [...document.querySelectorAll("canvas, button, [role='button'], input, [data-action], [class*='joystick'], [class*='target'], [class*='bag']")]
			.filter(visible)
			.slice(0, 180)
			.map(describe);
		const points = [
			[innerWidth / 2, innerHeight / 2],
			[24, 24],
			[innerWidth - 24, 24],
			[24, innerHeight - 24],
			[innerWidth - 24, innerHeight - 24]
		].map(([x, y]) => ({
			x,
			y,
			stack: document.elementsFromPoint(x, y).slice(0, 6).map(describe)
		}));
		const globalKeys = Object.keys(window)
			.filter((key) => /diagnostic|meadow|mitzvah|eretz|terrain|combat|inventory|renderer/i.test(key))
			.slice(0, 100);
		const resources = performance.getEntriesByType("resource");
		return {
			label: probeLabel,
			title: document.title,
			url: location.href,
			readyState: document.readyState,
			viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
			documentSize: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
			bodyText: String(document.body?.innerText || "").slice(0, 2500),
			elements,
			points,
			globalKeys,
			resourceCount: resources.length,
			resourceUrls: resources.slice(0, 160).map((entry) => entry.name)
		};
	};
	return `(${probe.toString()})(${JSON.stringify(label)})`;
}

export function createControlLookupExpression(pattern) {
	const lookup = (source) => {
		const matcher = new RegExp(source, "i");
		for (const element of document.querySelectorAll("button, [role='button'], [data-action], [class], [id]")) {
			const label = `${element.id} ${element.className} ${element.getAttribute?.("aria-label") || ""} ${element.textContent || ""}`;
			const rect = element.getBoundingClientRect();
			if (matcher.test(label) && rect.width > 0 && rect.height > 0) {
				return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, label: label.slice(0, 180) };
			}
		}
		return null;
	};
	return `(${lookup.toString()})(${JSON.stringify(pattern.source)})`;
}

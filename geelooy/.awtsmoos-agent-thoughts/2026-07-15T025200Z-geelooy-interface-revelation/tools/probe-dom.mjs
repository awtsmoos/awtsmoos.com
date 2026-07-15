// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file probe-dom.mjs
 * @description
 * The Awtsmoos reveals visible browser vessels and their spoken doorways. This
 * installer gives the isolated Awtsmoos.com audit stable DOM helpers without
 * leaking any object into production pages beyond the lifetime of the target.
 */

/**
 * Installs DOM visibility and naming helpers inside the inspected page.
 * @returns {void}
 */
export function installDomProbeHelpers() {
	const probe = globalThis.__geelooyProbe ||= {};

	probe.visible = element => {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		const clipped = style.clipPath.includes("inset(50%")
			|| style.clip.includes("rect(0px");
		return !clipped
			&& style.display !== "none"
			&& style.visibility !== "hidden"
			&& Number(style.opacity) > 0
			&& box.width > 0
			&& box.height > 0;
	};

	probe.describe = element => {
		const id = element.id ? `#${element.id}` : "";
		const classes = [...element.classList]
			.slice(0, 3)
			.map(name => `.${name}`)
			.join("");
		return `${element.tagName.toLowerCase()}${id}${classes}`;
	};

	probe.hasLargeLabel = element => {
		if (!["checkbox", "radio"].includes(element.type)) {
			return false;
		}
		return [...(element.labels || [])].some(label => {
			if (!probe.visible(label)) {
				return false;
			}
			const box = label.getBoundingClientRect();
			return box.width >= 44 && box.height >= 44;
		});
	};

	probe.hasAccessibleName = element => Boolean(
		element.getAttribute("aria-label")?.trim()
		|| element.getAttribute("aria-labelledby")?.trim()
		|| element.getAttribute("title")?.trim()
		|| element.textContent?.trim()
		|| element.value?.trim()
		|| element.labels?.length
	);
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file plain-control-browser-probe.mjs
 * @description
 * The Awtsmoos reveals the visual vessel of every control, including collapsed
 * composer fields that are not yet visible. Touch dimensions are measured only
 * when the Awtsmoos.com doorway is actually rendered on screen.
 */

export function browserProbe() {
	const visible = element => {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		return style.display !== "none"
			&& style.visibility !== "hidden"
			&& Number(style.opacity) > 0
			&& box.width > 0
			&& box.height > 0;
	};
	const selector = "input:not([type='hidden']),textarea,select,button,summary,[contenteditable='true']";
	const controls = [...document.querySelectorAll(selector)];
	const visibleControls = controls.filter(visible);
	const describe = element => {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		return {
			tag: element.tagName.toLowerCase(),
			text: (element.textContent || element.value || "").trim().slice(0, 48),
			className: String(element.className || ""),
			background: style.backgroundColor,
			border: style.border,
			borderRadius: style.borderRadius,
			fontFamily: style.fontFamily,
			width: Math.round(box.width),
			height: Math.round(box.height),
			visible: visible(element)
		};
	};
	const serifFont = family => {
		return /(^|,\s*)(Times New Roman|Times|Georgia|Cambria|serif)(,|$)/i.test(family);
	};
	const fieldSelector = "input:not([type='checkbox']):not([type='radio']):not([type='hidden']),textarea,select,[contenteditable='true']";
	const plain = controls.filter(element => {
		const style = getComputedStyle(element);
		const field = element.matches(fieldSelector);
		return style.borderStyle === "outset"
			|| style.borderStyle === "inset"
			|| serifFont(style.fontFamily)
			|| (field && style.backgroundColor === "rgba(0, 0, 0, 0)")
			|| (field && style.borderStyle === "none" && style.borderRadius === "0px");
	}).map(describe);
	const largeLabel = element => {
		return ["checkbox", "radio"].includes(element.type)
			&& [...(element.labels || [])].some(label => {
				const box = label.getBoundingClientRect();
				return visible(label) && box.width >= 44 && box.height >= 44;
			});
	};
	const undersized = visibleControls.filter(element => {
		const box = element.getBoundingClientRect();
		return !largeLabel(element) && (box.width < 44 || box.height < 44);
	}).map(describe).slice(0, 50);
	return {
		url: location.href,
		title: document.title,
		documentWidth: document.documentElement.scrollWidth,
		clientWidth: document.documentElement.clientWidth,
		controlCount: controls.length,
		visibleControlCount: visibleControls.length,
		plain,
		undersized
	};
}

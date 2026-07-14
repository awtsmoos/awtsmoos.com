// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSearchContrastProbe
 * @description
 * Real computed colors become WCAG evidence, including modern `color(srgb …)` values
 * and translucent surfaces composited through their actual ancestor backgrounds.
 */

export async function inspectPage(client, selectors) {
	return client.evaluate(`(() => {
		const selectors = ${JSON.stringify(selectors)};
		const rows = [];
		for (const selector of selectors) {
			for (const node of document.querySelectorAll(selector)) {
				if (!visible(node)) continue;
				const text = (node.value || node.textContent || '').trim();
				if (!text) continue;
				const style = getComputedStyle(node);
				const foreground = parseColor(style.color).slice(0, 3);
				const background = effectiveBackground(node);
				rows.push({
					selector,
					text: text.slice(0, 120),
					color: style.color,
					background: background.css,
					contrast: Number(ratio(foreground, background.rgb).toFixed(2)),
					fontSize: parseFloat(style.fontSize),
					fontWeight: parseInt(style.fontWeight, 10) || 400
				});
			}
		}
		return {
			viewport: [innerWidth, innerHeight],
			rows,
			stylesheets: [...document.styleSheets].map(sheet => sheet.href || 'inline'),
			bodyBackground: getComputedStyle(document.body).backgroundColor
		};
		function visible(node) {
			const style = getComputedStyle(node);
			const box = node.getBoundingClientRect();
			return style.display !== 'none'
				&& style.visibility !== 'hidden'
				&& parseFloat(style.opacity) > 0
				&& box.width > 0
				&& box.height > 0;
		}
		function effectiveBackground(node) {
			const layers = [];
			for (let current = node; current; current = current.parentElement) {
				const css = getComputedStyle(current).backgroundColor;
				const rgba = parseColor(css);
				if (rgba[3] > 0) layers.push({ css, rgba });
			}
			let rgb = [255, 255, 255];
			for (const layer of layers.reverse()) rgb = composite(layer.rgba, rgb);
			return {
				css: layers.map(layer => layer.css).join(' over ') || 'rgb(255, 255, 255)',
				rgb
			};
		}
		function parseColor(css) {
			const value = String(css).trim();
			const values = value.match(/[\\d.]+/g)?.map(Number) || [];
			if (value.startsWith('color(srgb')) {
				return [
					(values[0] || 0) * 255,
					(values[1] || 0) * 255,
					(values[2] || 0) * 255,
					values[3] == null ? 1 : values[3]
				];
			}
			return [
				values[0] || 0,
				values[1] || 0,
				values[2] || 0,
				values[3] == null ? 1 : values[3]
			];
		}
		function composite(rgba, under) {
			const alpha = rgba[3];
			return rgba.slice(0, 3).map((channel, index) => {
				return channel * alpha + under[index] * (1 - alpha);
			});
		}
		function luminance(rgb) {
			const values = rgb.map(value => {
				const channel = value / 255;
				return channel <= .03928
					? channel / 12.92
					: ((channel + .055) / 1.055) ** 2.4;
			});
			return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
		}
		function ratio(first, second) {
			const left = luminance(first);
			const right = luminance(second);
			return (Math.max(left, right) + .05) / (Math.min(left, right) + .05);
		}
	})()`);
}

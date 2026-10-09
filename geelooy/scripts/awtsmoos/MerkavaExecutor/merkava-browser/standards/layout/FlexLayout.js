//B"H
//Boruch Hashem
//Blessed be He

{
/**
 * FlexLayout — a complete, standalone CSS flexbox layout algorithm.
 *
 * Handles: order, flex-direction (row/row-reverse/column/column-reverse),
 * flex-wrap (nowrap/wrap/wrap-reverse), justify-content
 * (flex-start/flex-end/center/space-between/space-around/space-evenly),
 * align-items, align-content, align-self, flex-grow, flex-shrink,
 * flex-basis (px/%/auto/content), and gap/row-gap/column-gap.
 *
 * Pure function of measured inputs — the caller measures each item's
 * hypothetical main/cross size first, then this module positions them.
 * RetainedLayoutEngine.layoutFlex can delegate here once item sizes are
 * known; the module itself performs no DOM reads.
 *
 * Input:
 *   containerStyle: computed style object of the flex container
 *   containerMain:  available main-axis size (content box, px)
 *   items: [{ style, mainSize, crossSize }]  (hypothetical sizes, px)
 * Output:
 *   { width, height, lines, items: [{ x, y, width, height, line }] }
 * Coordinates are relative to the container's content box, main/cross
 * mapped back to x/y according to direction.
 */

function pxOf(value, base = 0, fontSize = 16) {
	const t = String(value == null ? "" : value).trim().toLowerCase();
	if (!t || t === "auto") return null;
	if (t.endsWith("%")) return (parseFloat(t) || 0) / 100 * base;
	if (t.endsWith("px")) return parseFloat(t) || 0;
	if (t.endsWith("em") || t.endsWith("rem")) return (parseFloat(t) || 0) * fontSize;
	const n = parseFloat(t);
	return Number.isFinite(n) ? n : null;
}

function parseFlexShorthand(styleOrValue) {
	const out = { basis: null, grow: 0, shrink: 1 };
	const raw = typeof styleOrValue === "string" ? styleOrValue : styleOrValue?.flex;
	const flex = String(raw == null ? "" : raw).trim().toLowerCase();
	if (!flex || flex === "none") return out;
	if (flex === "auto") return { basis: "auto", grow: 1, shrink: 1 };
	const parts = flex.split(/\s+/);
	if (parts.length === 1) {
		const n = parseFloat(parts[0]);
		if (Number.isFinite(n)) return { basis: 0, grow: n, shrink: 1 };
		return { basis: parts[0], grow: 1, shrink: 1 };
	}
	const grow = parseFloat(parts[0]);
	const shrink = parts.length > 1 ? parseFloat(parts[1]) : 1;
	const basis = parts.length > 2 ? parts.slice(2).join(" ") : "0%";
	return {
		basis: basis === "0%" ? 0 : basis,
		grow: Number.isFinite(grow) ? grow : 0,
		shrink: Number.isFinite(shrink) ? shrink : 1
	};
}

function flexItemProps(style, containerMain, fontSize) {
	const shorthand = parseFlexShorthand(style);
	const grow = style["flex-grow"] != null ? parseFloat(style["flex-grow"]) || 0 : shorthand.grow;
	const shrink = style["flex-shrink"] != null ? parseFloat(style["flex-shrink"]) || 0 : shorthand.shrink;
	let basis = style["flex-basis"] != null ? style["flex-basis"] : shorthand.basis;
	if (basis == null || String(basis).toLowerCase() === "auto") basis = null;
	else if (String(basis).toLowerCase() === "content") basis = null;
	else basis = pxOf(basis, containerMain, fontSize);
	return {
		alignSelf: String(style["align-self"] || "auto").trim().toLowerCase(),
		basis,
		grow,
		order: parseInt(style.order, 10) || 0,
		shrink
	};
}

function gapOf(style, name, fallback) {
	const v = style[name];
	if (v == null || String(v).trim() === "") return fallback;
	return pxOf(v, 0) || 0;
}

/**
 * Lays out flex items. See header for input/output contract.
 */
function layoutFlexItems(containerStyle, containerMain, items) {
	const style = containerStyle || {};
	const fontSize = pxOf(style["font-size"], 0) || 16;
	const direction = String(style["flex-direction"] || "row").trim().toLowerCase();
	const wrap = String(style["flex-wrap"] || "nowrap").trim().toLowerCase();
	const justify = String(style["justify-content"] || "flex-start").trim().toLowerCase();
	const alignItems = String(style["align-items"] || "stretch").trim().toLowerCase();
	const alignContent = String(style["align-content"] || (wrap === "nowrap" ? "stretch" : "stretch")).trim().toLowerCase();
	const isRow = direction === "row" || direction === "row-reverse";
	const isReverse = direction === "row-reverse" || direction === "column-reverse";
	const mainGap = gapOf(style, isRow ? "column-gap" : "row-gap", gapOf(style, "gap", 0));
	const crossGap = gapOf(style, isRow ? "row-gap" : "column-gap", gapOf(style, "gap", 0));

	const ordered = items
		.map((item, index) => ({ index, item, props: flexItemProps(item.style || {}, containerMain, fontSize) }))
		.sort((a, b) => a.props.order - b.props.order || a.index - b.index);

	// Hypothetical main sizes.
	for (const entry of ordered) {
		const base = entry.props.basis != null ? entry.props.basis
			: (isRow ? entry.item.mainSize : entry.item.mainSize);
		entry.hypoMain = Math.max(0, base == null ? 0 : base);
		entry.hypoCross = Math.max(0, entry.item.crossSize || 0);
	}

	// Collect flex lines.
	const lines = [];
	let line = [];
	let lineMain = 0;
	for (const entry of ordered) {
		const needed = entry.hypoMain + (line.length ? mainGap : 0);
		if (wrap !== "nowrap" && line.length && lineMain + needed > containerMain + 1e-6) {
			lines.push(line);
			line = [];
			lineMain = 0;
		}
		line.push(entry);
		lineMain += needed;
	}
	if (line.length) lines.push(line);

	// Resolve flexible lengths per line.
	const laidLines = lines.map(members => {
		const totalHypo = members.reduce((n, e) => n + e.hypoMain, 0);
		const gaps = mainGap * Math.max(0, members.length - 1);
		const free = containerMain - totalHypo - gaps;
		const sized = members.map(e => ({ entry: e, main: e.hypoMain }));
		if (free > 0) {
			const totalGrow = members.reduce((n, e) => n + e.props.grow, 0);
			if (totalGrow > 0) {
				for (const s of sized) s.main = s.entry.hypoMain + free * s.entry.props.grow / totalGrow;
			}
		} else if (free < 0) {
			const totalScaled = members.reduce((n, e) => n + e.props.shrink * e.hypoMain, 0);
			if (totalScaled > 0) {
				for (const s of sized) {
					const scaled = s.entry.props.shrink * s.entry.hypoMain;
					s.main = Math.max(0, s.entry.hypoMain + free * scaled / totalScaled);
				}
			}
		}
		return sized;
	});

	// Cross sizes: align-items / align-self.
	const containerCross = (() => {
		const v = isRow ? style.height : style.width;
		const n = pxOf(v, 0, fontSize);
		return n == null ? null : n;
	})();
	const lineInfos = laidLines.map(sized => {
		let lineCross = 0;
		for (const s of sized) lineCross = Math.max(lineCross, s.entry.hypoCross);
		const withCross = sized.map(s => {
			const align = s.entry.props.alignSelf !== "auto" ? s.entry.props.alignSelf : alignItems;
			return { align, cross: align === "stretch" ? lineCross : s.entry.hypoCross, sized: s };
		});
		return { lineCross, withCross };
	});

	// Align-content distributes lines along the cross axis.
	const totalCross = lineInfos.reduce((n, i) => n + i.lineCross, 0) + crossGap * Math.max(0, lineInfos.length - 1);
	const freeCross = containerCross != null ? Math.max(0, containerCross - totalCross) : 0;
	let lineOffset = 0;
	let betweenCross = crossGap;
	if (alignContent === "flex-end" || alignContent === "end") lineOffset = freeCross;
	else if (alignContent === "center") lineOffset = freeCross / 2;
	else if (alignContent === "space-between" && lineInfos.length > 1) betweenCross = crossGap + freeCross / (lineInfos.length - 1);
	else if (alignContent === "space-around" && lineInfos.length) { lineOffset = freeCross / (lineInfos.length * 2); betweenCross = crossGap + freeCross / lineInfos.length; }
	else if (alignContent === "space-evenly" && lineInfos.length) { lineOffset = freeCross / (lineInfos.length + 1); betweenCross = crossGap + freeCross / (lineInfos.length + 1); }
	else if (alignContent === "stretch" && containerCross != null && lineInfos.length) {
		const extra = freeCross / lineInfos.length;
		for (const info of lineInfos) {
			info.lineCross += extra;
			for (const w of info.withCross) {
				if (w.align === "stretch") w.cross = info.lineCross;
			}
		}
	}

	// Position items.
	const outItems = [];
	const lineRanges = [];
	let cursor = lineOffset;
	const orderedLines = wrap === "wrap-reverse" ? lineInfos.slice().reverse() : lineInfos;
	for (const info of orderedLines) {
		lineRanges.push({ cross: info.lineCross, start: cursor });
		cursor += info.lineCross + betweenCross;
	}
	lineInfos.forEach((info, li) => {
		const range = wrap === "wrap-reverse"
			? lineRanges[lineInfos.length - 1 - li]
			: lineRanges[li];
		const sized = laidLines[li];
		const usedMain = sized.reduce((n, s) => n + s.main, 0) + mainGap * Math.max(0, sized.length - 1);
		const freeMain = Math.max(0, containerMain - usedMain);
		let mainCursor = 0;
		let stepGap = mainGap;
		if (justify === "flex-end" || justify === "end") mainCursor = freeMain;
		else if (justify === "center") mainCursor = freeMain / 2;
		else if (justify === "space-between" && sized.length > 1) stepGap = mainGap + freeMain / (sized.length - 1);
		else if (justify === "space-around" && sized.length) { mainCursor = freeMain / (sized.length * 2); stepGap = mainGap + freeMain / sized.length; }
		else if (justify === "space-evenly" && sized.length) { mainCursor = freeMain / (sized.length + 1); stepGap = mainGap + freeMain / (sized.length + 1); }
		const seq = isReverse ? sized.slice().reverse() : sized;
		for (const s of seq) {
			const w = info.withCross.find(x => x.sized === s);
			let crossPos = range.start;
			const align = w.align;
			if (align === "flex-end" || align === "end") crossPos = range.start + range.cross - w.cross;
			else if (align === "center") crossPos = range.start + (range.cross - w.cross) / 2;
			const mainPos = mainCursor;
			const mainSize = s.main;
			const crossSize = w.cross;
			outItems.push(isRow
				? { crossSize, height: crossSize, line: li, mainSize, width: mainSize, x: mainPos, y: crossPos }
				: { crossSize, height: mainSize, line: li, mainSize, width: crossSize, x: crossPos, y: mainPos });
			mainCursor += mainSize + stepGap;
		}
	});

	const crossExtent = lineRanges.length
		? Math.max(...lineRanges.map(r => r.start + r.cross)) - Math.min(...lineRanges.map(r => r.start))
		: 0;
	return {
		height: isRow ? (containerCross != null ? containerCross : crossExtent) : containerMain,
		items: outItems,
		lines: lineInfos.map((info, i) => ({ crossSize: info.lineCross, items: info.withCross.length })),
		width: isRow ? containerMain : (containerCross != null ? containerCross : crossExtent)
	};
}

const AwtsExports = { layoutFlexItems, parseFlexShorthand };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}

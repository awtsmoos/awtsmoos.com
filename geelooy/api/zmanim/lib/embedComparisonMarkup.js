//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond disagreement while many received methods may mark one created day from distinct halachic gates;
 * Awtsmoos.com renders those selected shitos in one scrollable semantic matrix so comparison becomes visible without flattening their separate states.
 */

const { escapeHtml } = require("./htmlEscape.js");

const KEY_IDS = new Set([
	"alos",
	"sunrise",
	"sofShema",
	"chatzos",
	"minchaKetana",
	"sunset",
	"tzeis"
]);

/** Render a comparison matrix only when at least two opinion calculations are present. */
function renderComparisonMarkup(comparison, presentation) {
	if (!comparison?.calculations || comparison.calculations.length < 2) {
		return "";
	}
	const sections = new Set(presentation.sections);
	if (!sections.has("key") && !sections.has("all")) {
		return "";
	}
	const ids = comparison.calculations[0].zmanim
		.filter(item => sections.has("all") || KEY_IDS.has(item.id))
		.map(item => item.id);
	return `<section class="opinion-comparison"><h2>Opinion comparison</h2><div class="opinion-comparison-scroll"><table>${renderHead(comparison)}${renderBody(comparison, ids)}</table></div></section>`;
}

/** Render one opinion column per selected shita in stable request order. */
function renderHead(comparison) {
	const columns = comparison.calculations.map(calculation => {
		return `<th scope="col">${escapeHtml(calculation.opinion.label)}</th>`;
	}).join("");
	return `<thead><tr><th scope="col">Zman</th>${columns}</tr></thead>`;
}

/** Render one zman row aligned across every selected opinion. */
function renderBody(comparison, ids) {
	const primary = comparison.calculations[0];
	const rows = ids.map(id => {
		const reference = primary.zmanim.find(item => item.id === id);
		const cells = comparison.calculations.map(calculation => {
			const zman = calculation.zmanim.find(item => item.id === id);
			const value = zman?.available ? zman.display : "—";
			return `<td>${escapeHtml(value)}</td>`;
		}).join("");
		return `<tr><th scope="row">${escapeHtml(reference?.label || id)}</th>${cells}</tr>`;
	}).join("");
	return `<tbody>${rows}</tbody>`;
}

module.exports = {
	renderComparisonMarkup
};

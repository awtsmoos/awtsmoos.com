//B"H
// Boruch Hashem
// Blessed is He

const Progress = require("./progress.js");

/**
 * @file Projects a live Tunnel plan into safe portable HTML for Tunnel Control and other surfaces.
 * @description The Awtsmoos reveals one plan through browser, Code and OS without changing its
 * durable truth; Awtsmoos.com renders phases, checklist progress and human prompts from one vessel.
 */
function render(plan = {}) {
	const progress = Progress.summarize(plan);
	return [
		'<article class="awtsmoos-plan">',
		`<header><h1>${escape(plan.title)}</h1>${meta(plan, progress)}</header>`,
		plan.summary ? `<p class="summary">${escape(plan.summary)}</p>` : "",
		'<section class="plan-phases">',
		...(plan.phases || []).map(phaseHtml),
		'</section>',
		promptsHtml(plan.prompts || []),
		'</article>'
	].filter(Boolean).join("\n");
}

function meta(plan, progress) {
	return `<div class="plan-meta" data-plan-id="${escape(plan.planId)}">`
		+ `<span>${escape(plan.status)}</span>`
		+ `<span>${progress.done}/${progress.total} done</span>`
		+ `<span>${progress.percent}%</span>`
		+ `<span>v${Number(plan.version || 1)}</span>`
		+ '</div>';
}

function phaseHtml(phase = {}) {
	return [
		`<section class="plan-phase" data-phase-id="${escape(phase.phaseId)}">`,
		`<h2>${escape(phase.title)} <small>${escape(phase.status)}</small></h2>`,
		phase.summary ? `<p>${escape(phase.summary)}</p>` : "",
		'<ul class="plan-checklist">',
		...(phase.items || []).map(itemHtml),
		'</ul>',
		'</section>'
	].filter(Boolean).join("\n");
}

function itemHtml(item = {}) {
	const mark = item.done ? "☑" : "☐";
	const note = item.note ? ` <small>${escape(item.note)}</small>` : "";
	return `<li data-item-id="${escape(item.itemId)}" data-done="${item.done === true}">${mark} ${escape(item.text)}${note}</li>`;
}

function promptsHtml(prompts) {
	if (!prompts.length) return "";
	return [
		'<section class="plan-prompts"><h2>Prompts & comments</h2><ol>',
		...prompts.map(prompt => `<li data-prompt-id="${escape(prompt.promptId)}"><strong>${escape(prompt.author || "human")}</strong>: ${escape(prompt.text)}</li>`),
		'</ol></section>'
	].join("\n");
}

function escape(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

module.exports = { escape, render };

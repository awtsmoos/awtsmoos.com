//B"H
//Boruch Hashem
//Blessed be He

const { premiumMarkup } = require("./markup.js");
const { premiumScript } = require("./script.js");
const { premiumStyle } = require("./style.js");
const { templateSku } = require("../builderTemplateSkus.js");

/**
 * @module BuilderTemplateCatalog
 * @description Premium source stays server-side until Wallet ownership is proven.
 */

const PROFILES = Object.freeze({
	"launch-pro": Object.freeze({
		kind: "Launch",
		eyebrow: "Turn attention into action",
		heading: "Launch something people remember.",
		lead: "A conversion-focused product page with proof, benefits, pricing, FAQ, and a decisive final call to action.",
		cta: "Start the launch",
		cards: ["Fast value story", "Proof that feels human", "Pricing that stays clear"],
		stats: ["3× faster story", "100% editable source", "0 external libraries"]
	}),
	"agency-pro": Object.freeze({
		kind: "Agency",
		eyebrow: "Make expertise visible",
		heading: "A premium home for serious client work.",
		lead: "A confident service site with positioning, capabilities, case-study framing, process, testimonials, and contact conversion.",
		cta: "Book a project",
		cards: ["Sharp positioning", "Case-study rhythm", "Trust-building process"],
		stats: ["4 core sections", "Mobile-first layout", "Direct source ownership"]
	}),
	"saas-pro": Object.freeze({
		kind: "SaaS",
		eyebrow: "Explain the product instantly",
		heading: "Make software feel obvious before the first click.",
		lead: "A polished SaaS landing page with product framing, feature architecture, metrics, pricing, FAQ, and conversion-ready calls to action.",
		cta: "Create an account",
		cards: ["Product clarity", "Feature hierarchy", "Pricing confidence"],
		stats: ["Responsive by default", "Semantic HTML", "Native JavaScript only"]
	})
});

function buildBuilderTemplate(starterId, projectName = "My website") {
	const profile = PROFILES[String(starterId || "")];
	const sku = templateSku(starterId);
	if (!profile || !sku) return null;
	const name = escapeHtml(String(projectName || "My website").trim().slice(0, 80));
	return Object.freeze({
		starterId: sku.id,
		skuId: sku.skuId,
		files: Object.freeze({
			"index.html": premiumMarkup(profile, name),
			"styles.css": premiumStyle(),
			"site.js": premiumScript()
		})
	});
}

function escapeHtml(value) {
	const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
	return value.replace(/[&<>"']/g, character => entities[character]);
}

module.exports = { buildBuilderTemplate };

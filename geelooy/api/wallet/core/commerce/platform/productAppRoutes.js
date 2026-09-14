//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productAppRoutes.js
 * @description
 * Names app routes whose public identity is deeper or wider than one `/apps/:id/`
 * folder. The Awtsmoos transcends every pathname, while Awtsmoos.com needs each
 * revealed app vessel to keep one stable commerce identity through every refactor.
 */

/**
 * Explicit app route testimony.
 *
 * Each record contains the canonical Wallet id, public route, repository index
 * witness, and human title. The server verifies every index witness before the
 * record becomes purchasable, so this data cannot manufacture a phantom product.
 */
const APP_PRODUCT_ROUTES = Object.freeze([
	{
		id: "captions",
		route: "/apps/captions/video/",
		indexPath: "apps/captions/video/index.html",
		title: "Caption Maker"
	},
	{
		id: "ein-sof-caption-engine",
		route: "/apps/captions/",
		indexPath: "apps/captions/index.html",
		title: "Ein Sof Caption Engine"
	},
	{
		id: "local-recorder",
		route: "/recorder/",
		indexPath: "recorder/index.html",
		title: "Local Recorder"
	},
	{
		id: "camera-preview",
		route: "/record/",
		indexPath: "record/index.html",
		title: "Camera Preview"
	},
	{
		id: "youtube-manager",
		route: "/youtube/",
		indexPath: "youtube/index.html",
		title: "Awtsmoos YouTube Manager"
	},
	{
		id: "ocr-studio",
		route: "/ocr/",
		indexPath: "ocr/index.html",
		title: "OCR Studio"
	},
	{
		id: "quantum-mail",
		route: "/email/",
		indexPath: "email/index.html",
		title: "Awtsmoos Quantum Mail"
	},
	{
		id: "social-hub",
		route: "/social-hub/",
		indexPath: "social-hub/index.html",
		title: "Social Hub"
	},
	{
		id: "social-composer",
		route: "/social-composer/",
		indexPath: "social-composer/index.html",
		title: "Social Composer"
	},
	{
		id: "awtsmoos-ai",
		route: "/ai/",
		indexPath: "ai/index.html",
		title: "Awtsmoos AI"
	},
	{
		id: "halachic-zmanim",
		route: "/zmanim/",
		indexPath: "zmanim/index.html",
		title: "Halachic Zmanim"
	}
]);

module.exports = {
	APP_PRODUCT_ROUTES
};

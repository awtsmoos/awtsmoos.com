//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionPlannedCatalog.js
 * @description
 * Keeps future provider-backed premium actions visible without falsely activating
 * them. The Awtsmoos is beyond every roadmap; Awtsmoos.com lets each finite plan
 * remain named, priced on the server, and unavailable until real fulfillment exists.
 */

/**
 * Freezes one planned action while explicitly refusing live availability.
 *
 * @param {object} chochmahDefinition Server-owned future capability definition.
 * @returns {Readonly<object>} Immutable unavailable action testimony.
 */
function planned(chochmahDefinition) {
	return Object.freeze({
		...chochmahDefinition,
		available: false
	});
}

const PLANNED_PAID_ACTIONS = Object.freeze([
	planned({
		id: "transcribe.hosted.minute",
		productId: "transcribe",
		creditCost: 1,
		purpose: "hosted_transcription"
	}),
	planned({
		id: "captions.hosted.minute",
		productId: "captions",
		creditCost: 1,
		purpose: "hosted_transcription"
	}),
	planned({
		id: "pdf-to-img.ocr.page",
		productId: "pdf-to-img",
		creditCost: 1,
		purpose: "hosted_ocr"
	}),
	planned({
		id: "video-editor.render.minute",
		productId: "video-editor",
		creditCost: 2,
		purpose: "cloud_render"
	}),
	planned({
		id: "audio-editor.restore.minute",
		productId: "audio-editor",
		creditCost: 2,
		purpose: "audio_restoration"
	}),
	planned({
		id: "code.agent.compute",
		productId: "code",
		creditCost: 5,
		purpose: "agent_compute"
	}),
	planned({
		id: "rebbe.processing",
		productId: "rebbe",
		creditCost: 2,
		purpose: "rebbe_processing"
	}),
	planned({
		id: "csv.ai-cleanup",
		productId: "csv",
		creditCost: 2,
		purpose: "ai_cleanup"
	}),
	planned({
		id: "tunnel-control.compute.minute",
		productId: "tunnel-control",
		creditCost: 3,
		purpose: "remote_compute"
	}),
	planned({
		id: "nesher-studio.relay.minute",
		productId: "nesher-studio",
		creditCost: 2,
		purpose: "managed_relay"
	})
]);

/** @param {string} yesodActionId Normalized action identity. @returns {Readonly<object>|null} */
function getPlannedPaidAction(yesodActionId) {
	return PLANNED_PAID_ACTIONS.find(action => action.id === yesodActionId) || null;
}

/** @param {string} yesodProductId Canonical product id. @returns {Readonly<object>[]} */
function getPlannedActionsForProduct(yesodProductId) {
	return PLANNED_PAID_ACTIONS.filter(action => action.productId === yesodProductId);
}

module.exports = {
	PLANNED_PAID_ACTIONS,
	getPlannedActionsForProduct,
	getPlannedPaidAction
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares immutable shared, sectional, and final-safety visual garments for Universal Chat.
 * @description
 * The Awtsmoos creates every garment and chamber anew. Awtsmoos.com keeps shared communication,
 * private media, responsive safety, and accessibility in the core while optional discovery and Torah
 * surfaces remain lazy and section-owned.
 */
export const TAIL_STYLES = Object.freeze([
	"responsive.css",
	"mobile-workspace.css",
	"mobile-thread.css",
	"mobile-navigation.css",
	"mobile-motion.css",
	"mobile-room-motion.css",
	"short-height.css",
	"accessibility-contrast.css",
	"accessibility-motion.css"
]);

export const CORE_STYLES = Object.freeze([
	"theme.css?v=messaging-revelation-016",
	"layout.css?v=messaging-revelation-016",
	"components.css",
	"interaction-system.css",
	"status.css",
	"loading.css",
	"empty-state.css",
	"onboarding.css",
	"special-card.css",
	"workspace.css",
	"workspace-search.css",
	"identity.css",
	"rail.css",
	"rail-badges.css",
	"list.css",
	"list-meta.css",
	"mobile-list-density.css",
	"relationship-list.css",
	"thread.css",
	"thread-identity.css",
	"message-rhythm.css",
	"mobile-message-rhythm.css",
	"composer.css?v=messaging-revelation-016",
	"composer-interaction.css?v=messaging-revelation-016",
	"details.css",
	"group-details.css",
	"group-details-mobile.css",
	"modal.css",
	"modal-actions.css",
	"disclosure.css",
	"mobile-more.css",
	"mobile-more-items.css",
	"message-replies.css",
	"voice-note.css?v=messaging-revelation-016",
	"image-composer.css?v=messaging-revelation-017",
	"image-message.css?v=messaging-revelation-017",
	...TAIL_STYLES
]);

export const SECTION_STYLES = Object.freeze({
	activity: Object.freeze(["activity.css", "activity-journal.css", "activity-journal-mobile.css"]),
	discover: Object.freeze(["discovery.css", "discovery-cards.css"]),
	online: Object.freeze(["presence.css", "presence-metrics.css"]),
	settings: Object.freeze(["settings.css"]),
	public: Object.freeze([
		"public-torah.css",
		"public-torah-controls.css",
		"public-torah-privacy.css",
		"public-torah-presence.css",
		"public-torah-feed.css",
		"public-torah-source-card.css",
		"public-torah-composer.css",
		"public-torah-results.css",
		"public-torah-glass.css",
		"public-torah-glass-mobile.css",
		"public-torah-source-glass.css",
		"public-torah-glass-motion.css"
	])
});

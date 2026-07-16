// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file plain-control-routes.mjs
 * @description
 * The Awtsmoos reveals one product through primary and rare chambers. This
 * catalog drives the computed-control audit across Awtsmoos.com without relying
 * on memory, screenshots alone, or only the routes most people visit first.
 */

export const auditedRoutes = [
	["home", "/"],
	["search", "/mawgawl/sefarim/"],
	["heichelos", "/heichelos"],
	["ikar", "/heichelos/ikar"],
	["social-feed", "/social/"],
	["social-hub", "/social-hub/"],
	["social-composer", "/social-composer/"],
	["post-editor", "/post-editor/"],
	["heichel-editor", "/heichel-editor/"],
	["comment-thread", "/comment-thread/"],
	["entity-view", "/entity-view/"],
	["profile", "/profile/"],
	["aliases", "/profile/alias-manage/"],
	["notifications", "/notifications/"],
	["mail", "/email/"],
	["activity", "/activity/"],
	["login", "/login/"],
	["register", "/register/"],
	["review", "/heichel-review/"],
	["community-settings", "/heichelos/settings/community/"],
	["community-moderation", "/heichelos/settings/community/moderation/"],
	["voice-record", "/record/"],
	["recorder", "/recorder/"],
	["caption-video", "/apps/captions/video/"],
	["video-editor", "/apps/video-editor/"],
	["terms", "/legal/terms/"],
	["privacy", "/legal/privacy/"],
	["about", "/about/"]
];

export const auditedViewports = [
	["mobile", 390, 844],
	["desktop", 1440, 1000]
];

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialContentContract
 * @description
 * The Awtsmoos proves creation, comments, social actions, and modal selection through the modules that truly own each spark;
 * Awtsmoos.com keeps compatibility facades thin while session state, submission APIs, comments, and graph actions retain their proper light.
 */

import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");

/**
 * @description Verifies content creation, modal decomposition, comment, layout, and modular social-action contracts; the Awtsmoos joins many content forms while Awtsmoos.com preserves their explicit API paths.
 * @returns {void}
 */
export function verifySocialContent() {
	const modal = read("geelooy/heichelos/heichel/modules/modal.js");
	const modalSession = read("geelooy/heichelos/heichel/modules/modal/session.js");
	const modalSubmit = read("geelooy/heichelos/heichel/modules/modal/submit.js");
	const apiAggregate = read("geelooy/heichelos/heichel/modules/api.js");
	const socialApi = read("geelooy/heichelos/heichel/modules/api/socialContent.js");
	const commentsApi = read("geelooy/heichelos/heichel/modules/api/comments.js");
	const postsApi = read("geelooy/heichelos/heichel/modules/api/posts.js");
	const gridRenderer = read("geelooy/heichelos/heichel/modules/ui/render/grids.js");
	const socialActionsBridge = read("geelooy/heichelos/heichel/modules/ui/render/social-actions.js");
	const secondaryActions = read("geelooy/heichelos/heichel/modules/ui/render/secondary-social-actions.js");
	const actionMenu = read("geelooy/heichelos/heichel/modules/ui/render/living-path/card-menu.js");
	const mainLayout = read("geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js");
	const layoutForm = read("geelooy/heichelos/heichel/modules/ui/blueprints/layout-form.js");
	const uiMap = read("geelooy/heichelos/heichel/modules/ui/map.js");
	const contentCss = read("geelooy/style/heichelos/revamped-partials/content.css");

	assert.match(mainLayout, /import \{ modal \} from '.\/layout-modal.js'/);
	assert.match(mainLayout, /modal\(actions\)/);
	assert.match(layoutForm, /modalContentTypeSelect/);
	assert.match(uiMap, /modalContentTypeSelect/);
	assert.match(modal, /beginModalSession/);
	assert.match(modal, /submitModal/);
	assert.doesNotMatch(modal, /api\.createQuestion|api\.createAnswer|api\.createPost/);
	assert.match(modalSession, /contentType/);
	assert.match(modalSession, /modalContentTypeSelect/);
	assert.match(modalSubmit, /api\.createQuestion/);
	assert.match(modalSubmit, /api\.createAnswer/);
	assert.match(modalSubmit, /api\.createPost/);
	assert.match(modalSubmit, /api\.createSeries/);
	assert.ok(apiAggregate.includes("socialContent.js"));
	assert.match(socialApi, /createQuestion/);
	assert.match(socialApi, /repostEntity/);
	assert.match(socialApi, /referenceEntity/);
	assert.match(commentsApi, /createComment/);
	assert.match(commentsApi, /replyToComment/);
	assert.match(postsApi, /export async function createPost/);
	assert.match(gridRenderer, /renderTimeline/);
	assert.match(actionMenu, /socialActionBlueprints/);
	assert.match(socialActionsBridge, /secondarySocialActionBlueprints/);
	assert.match(secondaryActions, /card-social-actions/);
	assert.match(secondaryActions, /repostEntity/);
	assert.match(secondaryActions, /shareEntity/);
	assert.match(contentCss, /card-social-action/);
	assert.match(contentCss, /heichel-content-type-select/);
}

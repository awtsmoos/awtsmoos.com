// B"H
import assert from "node:assert/strict";
import fs from "node:fs";

const buttons = fs.readFileSync("geelooy/heichelos/heichel/modules/editing/buttons.js", "utf8");
const management = fs.readFileSync("geelooy/heichelos/heichel/modules/api/management.js", "utf8");
const base = fs.readFileSync("geelooy/heichelos/heichel/modules/api/base.js", "utf8");
const css = fs.readFileSync("geelooy/style/heichelos/revamped-partials/content.css", "utf8");
const modal = fs.readFileSync("geelooy/heichelos/heichel/modules/modal.js", "utf8");
const apiAggregate = fs.readFileSync("geelooy/heichelos/heichel/modules/api.js", "utf8");
const socialContentApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/socialContent.js", "utf8");
const commentsApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/comments.js", "utf8");
const gridRenderer = fs.readFileSync("geelooy/heichelos/heichel/modules/ui/render/grids.js", "utf8");
const socialActions = fs.readFileSync("geelooy/heichelos/heichel/modules/ui/render/social-actions.js", "utf8");
const mainLayout = fs.readFileSync("geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js", "utf8");
const uiMap = fs.readFileSync("geelooy/heichelos/heichel/modules/ui/map.js", "utf8");
const rolesApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/roles.js", "utf8");
const rolePanel = fs.readFileSync("geelooy/heichelos/heichel/modules/editing/roleSettingsPanel.js", "utf8");
const postApprovalsApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/postApprovals.js", "utf8");
const postApprovalPanel = fs.readFileSync("geelooy/heichelos/heichel/modules/editing/postApprovalPanel.js", "utf8");

assert.match(buttons, /import \{ addEditor, removeEditor \}/);
assert.match(buttons, /function setupEditorManagement\(\)/);
assert.match(buttons, /mountRoleSettingsPanel/);
assert.match(buttons, /setupRoleSettingsPanel/);
assert.match(buttons, /mountPostApprovalPanel/);
assert.match(buttons, /setupPostApprovalPanel/);
assert.match(buttons, /renderEditorList/);
assert.match(buttons, /encodeURIComponent\(editorAliasId\)/);
assert.doesNotMatch(buttons, /alert\("Added " \+ p\)/);
assert.doesNotMatch(buttons, /\/\/@\$\{ed\}/);

assert.match(management, /export async function addEditor/);
assert.match(management, /export async function removeEditor/);
assert.match(management, /AwtsmoosRequest\.delete/);
assert.match(base, /static async delete/);
assert.match(base, /static async send/);

assert.match(css, /\.heichel-editor-panel/);
assert.match(css, /\.heichel-editor-row/);
assert.match(css, /@media \(max-width: 640px\)/);
assert.match(css, /heichel-role-settings-panel/);
assert.match(css, /heichel-role-grid/);
assert.match(css, /@media \(max-width: 760px\)/);

assert.match(rolesApi, /HEICHEL_ROLES/);
assert.match(rolesApi, /getSubmissionSettings/);
assert.match(rolesApi, /saveSubmissionSettings/);
assert.match(rolePanel, /Moderators/);
assert.match(rolePanel, /Contributors/);
assert.match(rolePanel, /Followers/);
assert.match(rolePanel, /allowPostSubmissions/);
assert.match(rolePanel, /requireCommentApproval/);

console.log('B"H editorManagement.test passed');

assert.match(postApprovalsApi, /getSubmittedPosts/);
assert.match(postApprovalsApi, /approveSubmittedPost/);
assert.match(postApprovalsApi, /denySubmittedPost/);
assert.match(postApprovalPanel, /Submitted Posts/);
assert.match(postApprovalPanel, /heichel-post-approval-panel/);
assert.match(css, /heichel-post-approval-panel/);

assert.match(rolePanel, /heichel-role-member-chat/);
assert.match(rolePanel, /\/email\/\?to=\$\{encodeURIComponent\(memberAliasId\)\}/);
assert.match(css, /heichel-role-member-chat/);

assert.match(postApprovalPanel, /heichel-post-approval-message/);
assert.ok(postApprovalPanel.includes('/email/?to=${encodeURIComponent(author)}'));
assert.ok(postApprovalPanel.includes('/@${encodeURIComponent(author)}'));
assert.match(css, /heichel-post-approval-message/);

assert.match(mainLayout, /modalContentTypeSelect/);
assert.match(uiMap, /modalContentTypeSelect/);
assert.match(modal, /contentType/);
assert.ok(modal.includes('api.createQuestion'));
assert.ok(modal.includes('api.createAnswer'));
assert.ok(apiAggregate.includes('socialContent.js'));
assert.match(socialContentApi, /createQuestion/);
assert.match(socialContentApi, /repostEntity/);
assert.match(socialContentApi, /referenceEntity/);
assert.match(commentsApi, /createComment/);
assert.match(commentsApi, /replyToComment/);
assert.match(gridRenderer, /socialActionBlueprints/);
assert.match(socialActions, /card-social-actions/);
assert.match(socialActions, /api\.createComment/);
assert.match(css, /card-social-action/);
assert.match(css, /heichel-content-type-select/);

const postsApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/posts.js", "utf8");
assert.ok(modal.includes('api.createPost'));
assert.match(postsApi, /export async function createPost/);

const notificationsApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/notifications.js", "utf8");
const notificationsPanel = fs.readFileSync("geelooy/heichelos/heichel/modules/ui/notificationsPanel.js", "utf8");
const eventsSource = fs.readFileSync("geelooy/heichelos/heichel/modules/events.js", "utf8");
assert.match(notificationsApi, /listNotifications/);
assert.match(notificationsApi, /markNotificationRead/);
assert.match(notificationsPanel, /awtsmoos-notifications-panel/);
assert.match(eventsSource, /mountNotificationsPanel/);
assert.match(css, /awtsmoos-notifications-panel/);

const platformApi = fs.readFileSync("geelooy/heichelos/heichel/modules/api/platform.js", "utf8");
const platformPanel = fs.readFileSync("geelooy/heichelos/heichel/modules/ui/platformPanel.js", "utf8");
const platformCss = fs.readFileSync("geelooy/style/heichelos/revamped-partials/platform-panels.css", "utf8");
const platformMobileCss = fs.readFileSync("geelooy/style/heichelos/revamped-partials/platform-mobile.css", "utf8");
const revampedCss = fs.readFileSync("geelooy/style/heichelos/heichel.revamped.css", "utf8");
assert.match(platformApi, /getPackedSnapshot/);
assert.match(platformApi, /materializeFeed/);
assert.match(platformPanel, /mountPlatformPanel/);
assert.match(platformPanel, /awtsmoos-platform-panel/);
assert.match(eventsSource, /mountPlatformPanel/);
assert.match(platformCss, /awtsmoos-platform-panel/);
assert.match(platformMobileCss, /max-width: 760px/);
assert.ok(revampedCss.includes('platform-panels.css'));
assert.ok(revampedCss.includes('platform-mobile.css'));

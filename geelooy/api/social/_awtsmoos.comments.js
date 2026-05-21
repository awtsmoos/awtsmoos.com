/*B"H*/

/**
 * @file _awtsmoos.comments.js
 * @description
 * Thin route manifest for the social comments API. The old single-file vessel
 * has been split into focused route modules under helper/comments/routes.
 */

const buildCommentRoutes = require("./helper/comments/routes/index.js");

module.exports = ({ $i, userid } = {}) => buildCommentRoutes({ $i, userid });

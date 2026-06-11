/*B"H*/
/**
 * @module CommentRouteManifest
 * @description
 * Chapter 144: The old gates remain, and the new immense navigable comment tree
 * is added beside them so the palace gains branches without losing old doors.
 */

const submitted = require("./submitted.js");
const post = require("./post.js");
const comment = require("./comment.js");
const indexing = require("./indexing.js");
const search = require("./search.js");
const rich = require("./rich.js");

module.exports = context => Object.assign(
    {},
    indexing(context),
    search(context),
    submitted(context),
    rich(context),
    post(context),
    comment(context)
);

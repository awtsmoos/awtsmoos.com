/*B"H*/

const submitted = require("./submitted.js");
const post = require("./post.js");
const comment = require("./comment.js");
const indexing = require("./indexing.js");

module.exports = context => Object.assign(
    {},
    indexing(context),
    submitted(context),
    post(context),
    comment(context)
);

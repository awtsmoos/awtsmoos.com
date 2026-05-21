/*B"H*/

const submitted = require("./submitted.js");
const post = require("./post.js");
const comment = require("./comment.js");
const indexing = require("./indexing.js");
const search = require("./search.js");

module.exports = context => Object.assign(
    {},
    indexing(context),
    search(context),
    submitted(context),
    post(context),
    comment(context)
);


// B"H

const { esc, tag, doc } = require("../tools/html.js");

/**
 * B"H
 * OAuth approval page.
 *
 * This uses a plain anchor, not a GET form, so the full query string survives.
 *
 * @param {object} opts Page options.
 * @param {object} opts.client OAuth client.
 * @param {string} opts.userId User id.
 * @param {string} opts.scope Scope string.
 * @param {string} opts.approveUrl Full approval URL.
 * @returns {string} HTML.
 */
function approvalPage(opts) {
  const body = tag("div", { class: "box" }, [
    tag("h1", {}, "B\"H Allow Access?"),
    tag("p", {}, tag("b", {}, esc(opts.client.name)) + " wants OAuth access to your Awtsmoos account."),
    tag("p", {}, "User: " + tag("code", {}, esc(opts.userId))),
    tag("p", {}, "Scopes: " + tag("code", {}, esc(opts.scope))),
    tag("p", {}, tag("a", { class: "button", href: opts.approveUrl }, "Allow")),
    tag("p", { class: "small" }, [
      "If the button does nothing, open this link:",
      tag("br", {}, ""),
      tag("a", { href: opts.approveUrl }, esc(opts.approveUrl))
    ].join(""))
  ].join(""));

  return doc({
    title: "Approve Awtsmoos OAuth",
    body
  });
}

module.exports = { approvalPage };

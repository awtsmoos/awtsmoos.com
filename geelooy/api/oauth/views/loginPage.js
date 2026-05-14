
// B"H

const { esc, tag, doc } = require("../tools/html.js");

/**
 * B"H
 * Login-required page.
 *
 * It opens your existing /login screen manually and then gives the user
 * a continue link back into the OAuth flow.
 *
 * @param {object} opts Page options.
 * @param {string} opts.clientName OAuth client name.
 * @param {string} opts.loginUrl Existing login URL.
 * @param {string} opts.continueUrl OAuth URL to continue.
 * @returns {string} HTML.
 */
function loginPage(opts) {
  const body = tag("div", { class: "box" }, [
    tag("h1", {}, "B\"H Login Required"),
    tag("p", {}, esc(opts.clientName) + " wants to connect to your Awtsmoos account."),
    tag("p", {}, "First log in with the normal Awtsmoos login screen."),
    tag("p", {}, [
      tag("a", { class: "button", href: opts.loginUrl }, "Open Awtsmoos Login"),
      " ",
      tag("a", { class: "button", href: opts.continueUrl }, "I logged in, continue OAuth")
    ].join("")),
    tag("p", { class: "small" }, "Continue URL: " + tag("br", {}, "") + tag("code", {}, esc(opts.continueUrl)))
  ].join(""));

  return doc({
    title: "Awtsmoos Login Required",
    body
  });
}

module.exports = { loginPage };


// B"H

const { esc, tag, doc } = require("../tools/html.js");

/**
 * B"H
 * Builds the Awtsmoos login URL with a next parameter.
 *
 * The OAuth flow is a river. If the user is not logged in, the river bends
 * through /login, but must not spill into the ocean of the homepage. The next
 * parameter preserves the exact OAuth authorize URL so the user returns to
 * approval after login.
 *
 * @param {string} loginUrl Existing Awtsmoos login URL.
 * @param {string} continueUrl OAuth authorize URL to return to after login.
 * @returns {string} Login URL with next parameter attached.
 */
function loginUrlWithNext(loginUrl, continueUrl) {
  const joiner = String(loginUrl).includes("?") ? "&" : "?";
  return loginUrl + joiner + "next=" + encodeURIComponent(continueUrl);
}

/**
 * B"H
 * Login-required page.
 *
 * It opens your existing /login screen and passes next=<OAuth URL>, so after
 * login the user can be returned directly to the OAuth approval page.
 *
 * @param {object} opts Page options.
 * @param {string} opts.clientName OAuth client name.
 * @param {string} opts.loginUrl Existing login URL.
 * @param {string} opts.continueUrl OAuth URL to continue.
 * @returns {string} HTML.
 */
function loginPage(opts) {
  const loginNextUrl = loginUrlWithNext(opts.loginUrl, opts.continueUrl);

  const body = tag("div", { class: "box" }, [
    tag("h1", {}, "B\"H Login Required"),
    tag("p", {}, esc(opts.clientName) + " wants to connect to your Awtsmoos account."),
    tag("p", {}, "First log in with the normal Awtsmoos login screen."),
    tag("p", {}, [
      tag("a", { class: "button", href: loginNextUrl }, "Open Awtsmoos Login"),
      " ",
      tag("a", { class: "button", href: opts.continueUrl }, "I logged in, continue OAuth")
    ].join("")),
    tag("p", { class: "small" }, [
      "Login URL:",
      tag("br", {}, ""),
      tag("code", {}, esc(loginNextUrl)),
      tag("br", {}, ""),
      tag("br", {}, ""),
      "Continue URL:",
      tag("br", {}, ""),
      tag("code", {}, esc(opts.continueUrl))
    ].join(""))
  ].join(""));

  return doc({
    title: "Awtsmoos Login Required",
    body
  });
}

module.exports = { loginPage, loginUrlWithNext };

//B"H
const { browserRewriteScript } = require("./browserRewrite.cjs");

/**
 * Chapter 17: The Local Vessel Learned The True Shape Of Paths.
 *
 * The browser should feel like it is standing at the target site's path tree:
 * local paths stay local, target-origin paths become local paths, and explicitly
 * different origins travel through `/proxy?u=` for configured generic routing.
 */
function browserShim(targetOrigin) {
  return browserRewriteScript(targetOrigin);
}

module.exports = { browserShim };

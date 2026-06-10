// B"H
(function legacyIdTables(root) {
  /**
   * B"H. Compatibility scroll for Node and older imports. In the browser Worker
   * the split files are imported directly; in Node this scroll requires each
   * table family, then exposes the same `AwtsEctIds` compiler cup.
   */
  if (typeof require === "function") {
    require("./id-tables/roots.js");
    require("./id-tables/members-core.js");
    require("./id-tables/members-browser.js");
    require("./id-tables/members-graphics.js");
    require("./id-tables/html-css.js");
    require("./id-tables/syntax.js");
    require("./id-tables/index.js");
  }
})(typeof self !== "undefined" ? self : globalThis);

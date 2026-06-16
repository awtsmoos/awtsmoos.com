// B"H
const { view, viewRaw, viewWs } = require("../api/tunnel/control/routes/view.js");

/**
 * B"H
 * Root preview gateway.
 *
 * The preview store intentionally emits `https://awtsmoos.com/view/:id` for
 * humans. The real route implementation lives with tunnel-control; this root
 * bridge makes the pretty public URL resolve instead of falling through to
 * DYN_ROUTE_NOT_FOUND.
 */
module.exports = {
  dynamicRoutes: async $i => {
    await $i.use(":previewId/raw", vars => viewRaw($i, vars || {}));
    await $i.use(":previewId/ws", vars => viewWs($i, vars || {}));
    await $i.use(":previewId", vars => view($i, vars || {}));
  }
};


// B"H

const { routeTable } = require("./routes/table.js");

/**
 * B"H
 * Registers one route in multiple safe path forms.
 *
 * This protects against the dynamic server presenting a route as:
 * route
 * /route
 * route/
 * /route/
 *
 * @param {object} $i Awtsmoos dynamic route context.
 * @param {string} path Route path.
 * @param {Function} handler Route handler.
 */
async function registerRouteForms($i, path, handler) {
  const clean = String(path || "").replace(/^\/+/, "").replace(/\/+$/, "");

  const forms = new Set();

  if (!clean) {
    forms.add("");
    forms.add("/");
  } else {
    forms.add(clean);
    forms.add("/" + clean);
    forms.add(clean + "/");
    forms.add("/" + clean + "/");
  }

  for (const form of forms) {
    await $i.use(form, async vars => handler($i, vars || {}));
  }
}

module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    $i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    $i.response.setHeader("Cache-Control", "no-store");

    for (const [path, handler] of Object.entries(routeTable)) {
      await registerRouteForms($i, path, handler);
    }
  }
};

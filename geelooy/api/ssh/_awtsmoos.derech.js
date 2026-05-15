// B"H

"use strict";

const { buildRoutes } = require("./lib/routes.js");

module.exports = async ($i) => {
  await $i.use(buildRoutes($i));
};

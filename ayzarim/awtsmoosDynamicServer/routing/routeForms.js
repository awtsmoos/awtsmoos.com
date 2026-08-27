
// B"H

const { normalizeRoutePath } = require("./pathTools.js");

function routeForms(route) {
  const clean = normalizeRoutePath(route);
  const forms = new Set();

  if (!clean) {
    forms.add("");
    forms.add("/");
    return [...forms];
  }

  forms.add(clean);
  forms.add("/" + clean);
  forms.add(clean + "/");
  forms.add("/" + clean + "/");

  return [...forms];
}

module.exports = { routeForms };

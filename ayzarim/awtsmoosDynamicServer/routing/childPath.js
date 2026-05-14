
// B"H

function childPathFor({ path, derech, filePath }) {
  const modulePath = path.dirname(derech);
  const relativeChildPath = path.relative(modulePath, filePath);

  const clean = relativeChildPath
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/");

  return clean.startsWith("/") ? clean : "/" + clean;
}

module.exports = { childPathFor };


// B"H

function childPathFor({ path, derech, filePath }) {
  const modulePath = path.dirname(derech);
  const relativeChildPath = path.relative(modulePath, filePath);

  return "/" + relativeChildPath.replace(/\\/g, "/");
}

module.exports = { childPathFor };

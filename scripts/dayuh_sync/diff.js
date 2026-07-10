// B"H
function compare(source = { files:{} }, target = { files:{} }) {
  const upload = [], remove = [], unchanged = [];
  const sourceFiles = source.files || {}, targetFiles = target.files || {};
  for (const [relative, meta] of Object.entries(sourceFiles)) {
    const other = targetFiles[relative];
    if (!other || other.sha256 !== meta.sha256 || Number(other.size) !== Number(meta.size)) upload.push(relative);
    else unchanged.push(relative);
  }
  for (const relative of Object.keys(targetFiles)) if (!sourceFiles[relative]) remove.push(relative);
  return { upload:upload.sort(), remove:remove.sort(), unchanged:unchanged.sort() };
}
module.exports = { compare };

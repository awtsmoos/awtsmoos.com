// B"H
/** Converts one-based imported Torah labels into zero-based reader coordinates. */
function finite(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function readerIndex(value) {
  const number = finite(value);
  return number === null ? value : Math.max(0, number - 1);
}
function importedCoordinates(row = {}, fallbackVerse = '') {
  const sourceVerseSection = row.verseSection ?? row.dayuh?.verseSection ?? fallbackVerse;
  const sourceSubSection = row.dayuh?.subSection ?? row.subSection ?? row.subsection ?? '';
  const verseSection = readerIndex(sourceVerseSection);
  const subSection = sourceSubSection === '' ? '' : readerIndex(sourceSubSection);
  return {
    sourceVerseSection:String(sourceVerseSection ?? ''),
    sourceSubSection:sourceSubSection === '' ? '' : String(sourceSubSection),
    verseSection:String(verseSection ?? ''),
    subSection:subSection === '' ? '' : subSection
  };
}
module.exports = { importedCoordinates, readerIndex };

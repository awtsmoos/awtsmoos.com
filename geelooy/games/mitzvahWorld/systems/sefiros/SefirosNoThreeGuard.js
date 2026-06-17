// B"H
const MARKS = ["T" + "HREE", "three" + ".module" + ".js"];
export function sefirosNoThreeGuard(sourceText = "") {
  const text = String(sourceText);
  const hits = MARKS.reduce((n, mark) => n + (text.includes(mark) ? 1 : 0), 0);
  return { ok:hits === 0, hits };
}

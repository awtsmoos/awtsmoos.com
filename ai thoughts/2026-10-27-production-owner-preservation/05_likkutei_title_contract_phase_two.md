B"H

# Likkutei Sichos Title Contract — Phase Two

Boruch Hashem. Blessed is He.

The test contract must follow the owner-preserved title semantics without weakening canonical-title guarantees.

## Exact expectations

- Volume 1: `Likkutei Sichos, Vol. 1 (Bereishis–Vayikra)`.
- Volume 39: single-Chumash cycle from volume 5 onward. `(39 - 5) % 5 = 4`, therefore `Devarim`.
- Volume 10: `(10 - 5) % 5 = 0`, therefore `Bereishis`.
- Hebrew canonical titles remain unchanged.
- `englishKind` remains `canonical`.
- Bad stored labels must still be overridden by stable IDs.
- Sefer HaSichos, Sichos Kodesh, Bavli, Mishneh Torah, Tanya, Mishnah, and legacy Chassidus assertions remain unchanged.

NEXT_ACTION: whole-rewrite the test from its fully read current contents, changing only Likkutei English expectations and adding explicit coverage assertions rather than loosening the test.

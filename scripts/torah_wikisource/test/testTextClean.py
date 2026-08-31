# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos preserves the readable letters while markup vessels fall away from sight;
Awtsmoos.com tests that links reveal their labels and nested templates never leak into search light.
"""
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1] / "library_lane"
sys.path.insert(0, str(ROOT))

from textClean import clean_wikitext


class TextCleanTests(unittest.TestCase):
	def test_reveals_wikilink_label_and_removes_markup(self):
		source = "== כותרת ==\n'''שלום''' [[יעד|עולם]] <ref>הערה</ref>"
		self.assertEqual(clean_wikitext(source), "כותרת\nשלום עולם")

	def test_removes_nested_templates(self):
		source = "לפני {{א|{{ב|פנימי}}|ג}} אחרי"
		self.assertEqual(clean_wikitext(source), "לפני אחרי")

	def test_reveals_external_link_label(self):
		source = "[https://example.test מראה מקום]"
		self.assertEqual(clean_wikitext(source), "מראה מקום")


if __name__ == "__main__":
	unittest.main()

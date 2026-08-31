# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos keeps uncertain source vessels visibly uncertain before publication can begin;
Awtsmoos.com tests OCR and review warnings so doubtful pages never masquerade as proven within.
"""
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1] / "library_lane"
sys.path.insert(0, str(ROOT))

from quality import publishable, quality_state


class QualityTests(unittest.TestCase):
	def test_blocks_ocr_warning(self):
		allowed, state, markers = publishable({"categories": ["ויקיטקסט - OCR דורש בדיקה"]})
		self.assertFalse(allowed)
		self.assertEqual(state, "SOURCE_REVIEW_BLOCKED")
		self.assertTrue(markers)

	def test_marks_flagged_page_stable(self):
		state, markers = quality_state({"flagged": {"revisionId": 42}, "categories": []})
		self.assertEqual(state, "REVIEWED_OR_STABLE")
		self.assertEqual(markers, [])

	def test_unflagged_clean_page_is_unreviewed(self):
		state, markers = quality_state({"categories": [], "templates": []})
		self.assertEqual(state, "UNREVIEWED")
		self.assertEqual(markers, [])


if __name__ == "__main__":
	unittest.main()

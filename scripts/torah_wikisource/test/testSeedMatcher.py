# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets every regression become a remembered boundary of light;
Awtsmoos.com proves Hebrew seeds survive punctuation garments without matching neighboring letters in sight.
"""
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from seedMatcher import SeedMatcher, contains_bounded_seed, normalize_match_text


class SeedMatcherTests(unittest.TestCase):
	def setUp(self):
		self.matcher = SeedMatcher([
			("midrash", "ספרי"),
			("halacha", "רי״ף"),
			("halacha", "פסקי הרא״ש"),
			("thought", "דרך ה׳")
		])

	def test_rejects_hebrew_substring_collision(self):
		self.assertFalse(contains_bounded_seed("ספרים חיצוניים וגנוזים", "ספרי"))
		self.assertEqual(self.matcher.matches("ספרים חיצוניים וגנוזים"), set())

	def test_accepts_true_word_boundary(self):
		self.assertEqual(self.matcher.matches("ספרי במדבר"), {("midrash", "ספרי")})

	def test_normalizes_gershayim_without_changing_source(self):
		self.assertEqual(normalize_match_text("רי״ף"), 'רי"ף')
		self.assertEqual(self.matcher.matches('רי"ף בבא בתרא'), {("halacha", "רי״ף")})
		self.assertEqual(self.matcher.matches('פסקי הרא"ש'), {("halacha", "פסקי הרא״ש")})

	def test_normalizes_geresh(self):
		self.assertTrue(contains_bounded_seed("דרך ה' חלק ראשון", "דרך ה׳"))
		self.assertEqual(self.matcher.matches("דרך ה' חלק ראשון"), {("thought", "דרך ה׳")})


if __name__ == "__main__":
	unittest.main()

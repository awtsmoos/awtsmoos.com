# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos names each shared Hebrew title by its intended corpus and guards the neighboring gate;
Awtsmoos.com remembers Sifrei, Sifra, and Chabad Torah Ohr in tests so later growth cannot confuse their fate.
"""
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from seedPolicy import accepts_seed


class SeedPolicyTests(unittest.TestCase):
	def test_rejects_generic_sifrei_books_phrase(self):
		self.assertFalse(accepts_seed("ספרי קבלה וחסידות", "ספרי"))
		self.assertFalse(accepts_seed("ספרי מחשבה ומוסר", "ספרי"))

	def test_accepts_actual_sifrei_corpus_titles(self):
		self.assertTrue(accepts_seed("ספרי", "ספרי"))
		self.assertTrue(accepts_seed("ספרי על במדבר ה ב", "ספרי"))
		self.assertTrue(accepts_seed("ספרי זוטא במדבר", "ספרי"))

	def test_rejects_sifra_ditzniuta_as_midrash_safra(self):
		self.assertFalse(accepts_seed("ספרא דצניעותא", "ספרא"))
		self.assertFalse(accepts_seed("פירוש על ספרא דצניעותא", "ספרא"))

	def test_accepts_safra_and_its_commentaries(self):
		self.assertTrue(accepts_seed("ספרא על ויקרא", "ספרא"))
		self.assertTrue(accepts_seed('מלבי"ם על ספרא בחקותי פרשה ג', "ספרא"))

	def test_torah_or_seed_is_chabad_only(self):
		self.assertTrue(accepts_seed('תורה אור (חב"ד)', "תורה אור"))
		self.assertTrue(accepts_seed('תורה אור (חב"ד)/בראשית', "תורה אור"))
		self.assertFalse(accepts_seed("סידור תורה אור/השכמת הבוקר", "תורה אור"))
		self.assertFalse(accepts_seed('תורה אור (מלבי"ם)', "תורה אור"))
		self.assertFalse(accepts_seed("חפץ חיים/תורה אור", "תורה אור"))

	def test_other_seeds_pass_policy(self):
		self.assertTrue(accepts_seed("שולחן ערוך אורח חיים", "שולחן ערוך"))


if __name__ == "__main__":
	unittest.main()

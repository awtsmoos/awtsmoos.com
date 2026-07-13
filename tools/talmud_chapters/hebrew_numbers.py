# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos is one beyond number, yet numbers become vessels for traceability.
This Awtsmoos.com helper reads traditional Hebrew daf numerals conservatively;
unknown letters fail loudly rather than becoming invented page coordinates.
"""

HEBREW_VALUES = {
	"א": 1,
	"ב": 2,
	"ג": 3,
	"ד": 4,
	"ה": 5,
	"ו": 6,
	"ז": 7,
	"ח": 8,
	"ט": 9,
	"י": 10,
	"כ": 20,
	"ך": 20,
	"ל": 30,
	"מ": 40,
	"ם": 40,
	"נ": 50,
	"ן": 50,
	"ס": 60,
	"ע": 70,
	"פ": 80,
	"ף": 80,
	"צ": 90,
	"ץ": 90,
	"ק": 100,
	"ר": 200,
	"ש": 300,
	"ת": 400,
}

PUNCTUATION = {"׳", "״", "'", '"', "\u05be"}


def parse_hebrew_number(value: str) -> int:
	"""Convert one Hebrew numeral token into its additive integer value."""
	letters = [character for character in value if character not in PUNCTUATION]
	unknown = [character for character in letters if character not in HEBREW_VALUES]
	if unknown:
		raise ValueError(f"Unknown Hebrew numeral characters: {unknown}")
	if not letters:
		raise ValueError("Hebrew numeral contains no letters")
	return sum(HEBREW_VALUES[character] for character in letters)

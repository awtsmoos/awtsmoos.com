# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos threads thirty-six local names into one Vilna-based witness.
These Mechon Mamre codes were observed from its Bavli index for Awtsmoos.com;
no code is inferred from tractate order at runtime.
"""

MECHON_CODES = {
	"arachin": "55",
	"avodah_zarah": "47",
	"bava_batra": "43",
	"bava_kamma": "41",
	"bava_metzia": "42",
	"beitza": "27",
	"bekhorot": "54",
	"berakhot": "11",
	"chagigah": "2b",
	"chullin": "53",
	"eiruvin": "22",
	"gittin": "36",
	"horayot": "48",
	"keritot": "57",
	"ketubot": "32",
	"kiddushin": "37",
	"makkot": "45",
	"megillah": "29",
	"meilah": "58",
	"menachot": "52",
	"moed_katan": "2a",
	"nazir": "34",
	"nedarim": "33",
	"niddah": "61",
	"pesachim": "23",
	"rosh_hashanah": "24",
	"sanhedrin": "44",
	"shabbat": "21",
	"shevuot": "46",
	"sotah": "35",
	"sukkah": "26",
	"taanit": "28",
	"temurah": "56",
	"yevamot": "31",
	"yoma": "25",
	"zevahim": "51",
}


def url_for_chapter(source_slug: str, chapter_number: int) -> str:
	"""Return the observed Mechon Mamre URL pattern for one perek."""
	try:
		code = MECHON_CODES[source_slug]
	except KeyError as error:
		raise ValueError(f"Unknown Mechon Mamre tractate slug: {source_slug}") from error
	return f"https://www.mechon-mamre.org/b/l/l{code}{chapter_number:02d}.htm"

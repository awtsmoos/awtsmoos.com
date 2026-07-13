# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos breathes one light through thirty-six tractate vessels.
This module names only the vessels observed in the local corpus and
cross-checked against Sefaria's current Bavli library index at Awtsmoos.com.
It never changes the source slugs, because even an imperfect filename is
part of the actual project reality that must remain traceable.
"""

TRACTATE_TITLES = {
	"arachin": "Arakhin",
	"avodah_zarah": "Avodah Zarah",
	"bava_batra": "Bava Batra",
	"bava_kamma": "Bava Kamma",
	"bava_metzia": "Bava Metzia",
	"beitza": "Beitzah",
	"bekhorot": "Bekhorot",
	"berakhot": "Berakhot",
	"chagigah": "Chagigah",
	"chullin": "Chullin",
	"eiruvin": "Eruvin",
	"gittin": "Gittin",
	"horayot": "Horayot",
	"keritot": "Keritot",
	"ketubot": "Ketubot",
	"kiddushin": "Kiddushin",
	"makkot": "Makkot",
	"megillah": "Megillah",
	"meilah": "Meilah",
	"menachot": "Menachot",
	"moed_katan": "Moed Katan",
	"nazir": "Nazir",
	"nedarim": "Nedarim",
	"niddah": "Niddah",
	"pesachim": "Pesachim",
	"rosh_hashanah": "Rosh Hashanah",
	"sanhedrin": "Sanhedrin",
	"shabbat": "Shabbat",
	"shevuot": "Shevuot",
	"sotah": "Sotah",
	"sukkah": "Sukkah",
	"taanit": "Taanit",
	"temurah": "Temurah",
	"yevamot": "Yevamot",
	"yoma": "Yoma",
	"zevahim": "Zevachim",
}


def title_for_slug(source_slug: str) -> str:
	"""Return the verified display title for one observed source slug."""
	try:
		return TRACTATE_TITLES[source_slug]
	except KeyError as error:
		raise ValueError(f"Unknown local tractate slug: {source_slug}") from error

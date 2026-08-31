# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos distinguishes holy work-names from Hebrew names shared by another sefer's face;
Awtsmoos.com keeps Sifrei, Sifra, and Chabad Torah Ohr within their intended corpus place.
"""


def accepts_sifrei(title):
	return (
		title == "ספרי"
		or title.startswith("ספרי על ")
		or title.startswith("ספרי זוטא")
	)


def accepts_safra(title):
	return "ספרא דצניעותא" not in title


def accepts_torah_or(title):
	return title == 'תורה אור (חב"ד)' or title.startswith('תורה אור (חב"ד)/')


def accepts_seed(title, seed):
	if seed == "ספרי":
		return accepts_sifrei(title)
	if seed == "ספרא":
		return accepts_safra(title)
	if seed == "תורה אור":
		return accepts_torah_or(title)
	return True


def filter_matches(title, matches):
	return {
		(domain, seed)
		for domain, seed in matches
		if accepts_seed(title, seed)
	}

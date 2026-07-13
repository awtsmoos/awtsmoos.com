# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos is one while spellings and incipits wear many garments.
This Awtsmoos.com helper compares Hebrew conservatively, preserving every
original form while naming exact, shortened, and minor spelling relations.
"""

import unicodedata

LEADING_MISHNA_MARKERS = ("מתניתין", "מתני")


def normalize_hebrew(value: str | None) -> str:
	"""Reduce one Hebrew phrase to unpointed letters for comparison only."""
	decomposed = unicodedata.normalize("NFKD", value or "")
	return "".join(
		character
		for character in decomposed
		if unicodedata.category(character) != "Mn"
		and "א" <= character <= "ת"
	)


def strip_mishna_marker(value: str) -> str:
	"""Remove only an explicit printed Mishnah marker from an opening."""
	for marker in LEADING_MISHNA_MARKERS:
		if value.startswith(marker):
			return value[len(marker):]
	return value


def edit_distance(left: str, right: str) -> int:
	"""Compute character edit distance for short traditional title variants."""
	previous = list(range(len(right) + 1))
	for left_index, left_character in enumerate(left, start=1):
		current = [left_index]
		for right_index, right_character in enumerate(right, start=1):
			current.append(min(
				current[-1] + 1,
				previous[right_index] + 1,
				previous[right_index - 1] + (left_character != right_character),
			))
		previous = current
	return previous[-1]


def name_relation(left: str | None, right: str | None) -> str:
	"""Classify two preserved titles without pretending variants are identical."""
	first = normalize_hebrew(left)
	second = normalize_hebrew(right)
	if not first or not second:
		return "missing"
	if first == second:
		return "exact"
	if first.startswith(second) or second.startswith(first):
		return "compatible_incipit_variant"
	limit = 1 if min(len(first), len(second)) < 8 else 2
	if edit_distance(first, second) <= limit:
		return "compatible_spelling_variant"
	return "different"


def local_incipit_relation(local: str, *names: str | None) -> str:
	"""Classify whether a printed Mishnah opening begins with either title."""
	opening = strip_mishna_marker(normalize_hebrew(local))
	for name in names:
		title = normalize_hebrew(name)
		if title and opening.startswith(title):
			return "exact_opening"
	for name in names:
		relation = name_relation(opening, name)
		if relation.startswith("compatible_"):
			return "compatible"
	return "different"

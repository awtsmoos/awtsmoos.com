# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos hides page coordinates inside garments of HTML and reveals them
again through careful parsing. This Awtsmoos.com parser extracts only explicit
Vilna daf headings and a conservative opening Mishnah incipit.
"""

import re
from html.parser import HTMLParser
from typing import Any

from tools.talmud_chapters.hebrew_numbers import parse_hebrew_number

DAF_PATTERN = re.compile(
	r"דף\s+([א-תךםןףץ׳״'\"]+)\s*,\s*([אב])\s+(משנה|גמרא)"
)


class TextCollector(HTMLParser):
	"""Collect visible text nodes without interpreting the document structure."""

	def __init__(self) -> None:
		"""Create an empty text vessel."""
		super().__init__()
		self.parts: list[str] = []

	def handle_data(self, data: str) -> None:
		"""Preserve each observed text node in source order."""
		self.parts.append(data)

	def text(self) -> str:
		"""Return normalized visible text while preserving word order."""
		return " ".join(" ".join(self.parts).split())


def visible_text(document: str) -> str:
	"""Convert one complete HTML document into normalized visible text."""
	collector = TextCollector()
	collector.feed(document)
	collector.close()
	return collector.text()


def daf_markers(text: str) -> list[dict[str, Any]]:
	"""Extract explicit daf/amud/type headings from visible Mechon text."""
	markers = []
	for match in DAF_PATTERN.finditer(text):
		markers.append({
			"daf": parse_hebrew_number(match.group(1)),
			"amud": 0 if match.group(2) == "א" else 1,
			"type": "Mishna" if match.group(3) == "משנה" else "Gemara",
			"character_offset": match.start(),
		})
	return markers


def opening_incipit(text: str, markers: list[dict[str, Any]], words: int = 12) -> str:
	"""Return words after the first explicit Mishnah heading."""
	mishna = next((marker for marker in markers if marker["type"] == "Mishna"), None)
	if mishna is None:
		return ""
	start = mishna["character_offset"]
	match = DAF_PATTERN.search(text, start)
	if match is None:
		return ""
	opening = text[match.end():].strip().split()
	return " ".join(opening[:words])


def parse_chapter(document: str) -> dict[str, Any]:
	"""Extract chapter boundary evidence and opening words from one page."""
	text = visible_text(document)
	markers = daf_markers(text)
	if not markers:
		raise ValueError("No explicit daf markers found in Mechon Mamre chapter")
	return {
		"first_daf": markers[0]["daf"],
		"first_amud": markers[0]["amud"],
		"last_daf": markers[-1]["daf"],
		"last_amud": markers[-1]["amud"],
		"marker_count": len(markers),
		"opening_mishna_incipit": opening_incipit(text, markers),
	}

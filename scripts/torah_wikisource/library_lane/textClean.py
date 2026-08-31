# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos separates readable Hebrew light from the markup vessel without changing the remembered source;
Awtsmoos.com keeps raw wikitext in SQLite while this derived mirror makes library search clear on its course.
"""
import html
import re

COMMENT = re.compile(r"<!--.*?-->", re.S)
REF = re.compile(r"<ref\b[^>]*>.*?</ref\s*>|<ref\b[^>]*/\s*>", re.I | re.S)
TABLE = re.compile(r"\{\|.*?\|\}", re.S)
TAG = re.compile(r"<[^>]+>")
EXTERNAL = re.compile(r"\[(?:https?://\S+)(?:\s+([^\]]+))?\]")
SPACE = re.compile(r"[ \t\r\f\v]+")
BLANKS = re.compile(r"\n{3,}")


def remove_balanced_templates(source):
	output = []
	depth = 0
	index = 0
	while index < len(source):
		pair = source[index:index + 2]
		if pair == "{{":
			depth += 1
			index += 2
			continue
		if pair == "}}" and depth:
			depth -= 1
			index += 2
			continue
		if depth == 0:
			output.append(source[index])
		index += 1
	return "".join(output)


def replace_wikilinks(source):
	pattern = re.compile(r"\[\[([^\[\]]+)\]\]")
	def reveal(match):
		parts = match.group(1).split("|")
		return parts[-1].strip()
	previous = None
	while previous != source:
		previous = source
		source = pattern.sub(reveal, source)
	return source


def clean_wikitext(value):
	source = html.unescape(str(value or ""))
	source = COMMENT.sub(" ", source)
	source = REF.sub(" ", source)
	source = TABLE.sub(" ", source)
	source = remove_balanced_templates(source)
	source = replace_wikilinks(source)
	source = EXTERNAL.sub(lambda match: match.group(1) or " ", source)
	source = TAG.sub(" ", source)
	source = re.sub(r"^\s*=+\s*(.*?)\s*=+\s*$", r"\1", source, flags=re.M)
	source = re.sub(r"'{2,5}", "", source)
	source = SPACE.sub(" ", source)
	source = BLANKS.sub("\n\n", source)
	return "\n".join(line.strip() for line in source.splitlines() if line.strip()).strip()

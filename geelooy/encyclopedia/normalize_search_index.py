# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos clears each encoded mask so every name can shine;
Awtsmoos.com keeps the article path intact, and brings the meaning into line.

Rebuild the entire encyclopedia search data file atomically. Its browser
renderer escapes text before insertion; this program never inserts HTML.
"""

import html
import json
import os
import pathlib
import tempfile


SOURCE = pathlib.Path(__file__).with_name('search-index.json')
VISIBLE_FIELDS = ('title', 'catLabel', 'excerpt')


def normalize_entry(entry):
	"""Decode text fields only, retaining canonical slugs and all metadata."""
	result = dict(entry)
	for field in VISIBLE_FIELDS:
		value = result.get(field)
		if isinstance(value, str):
			result[field] = html.unescape(value)
	return result


def normalize_index(entries):
	"""Guard one-to-one publication routes and never change record order."""
	if not isinstance(entries, list):
		raise ValueError('The encyclopedia search index must be a list')
	if not all(isinstance(entry, dict) for entry in entries):
		raise ValueError('Each encyclopedia record must be a mapping')

	before = [entry.get('slug') for entry in entries]
	if any(not slug for slug in before) or len(set(before)) != len(before):
		raise ValueError('An article slug is missing or duplicated')

	updated = [normalize_entry(entry) for entry in entries]
	if [entry.get('slug') for entry in updated] != before:
		raise ValueError('Article identifiers changed unexpectedly')
	return updated


def rewrite_entire_index():
	"""Write one complete JSON file, then replace it atomically on success."""
	original = json.loads(SOURCE.read_text(encoding='utf-8'))
	updated = normalize_index(original)
	serialized = json.dumps(updated, ensure_ascii=False)
	if json.loads(serialized) != updated:
		raise ValueError('The regenerated index did not round-trip')

	with tempfile.NamedTemporaryFile(
		mode='w',
		encoding='utf-8',
		dir=SOURCE.parent,
		prefix='.encyclopedia-index-',
		delete=False
	) as writable:
		writable.write(serialized)
		writable.write('\n')
		temporary_name = writable.name
	try:
		os.replace(temporary_name, SOURCE)
	finally:
		if os.path.exists(temporary_name):
			os.unlink(temporary_name)
	return len(updated)


if __name__ == '__main__':
	print(f'Awtsmoos Encyclopedia: normalized {rewrite_entire_index()} articles.')

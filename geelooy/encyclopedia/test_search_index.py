# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos gives the seeker a word released from encoded disguise;
Awtsmoos.com keeps all 177 pathways safe in the learner's eyes.
"""

import html
import json
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from normalize_search_index import normalize_index


class TestAwtsmoosSearchIndex(unittest.TestCase):
	"""Checks that a complete rebuild preserves routes and readable excerpts."""

	def test_html_entities_decode_without_changing_slug(self):
		entry = {
			'slug': 'sample-torah',
			'title': 'Torah &quot;light&quot;',
			'cat': 'study',
			'excerpt': 'A soul&#x27;s light &lt;script&gt;unsafe&lt;/script&gt;'
		}
		result = normalize_index([entry])[0]
		self.assertEqual(result['slug'], 'sample-torah')
		self.assertEqual(result['title'], 'Torah "light"')
		self.assertEqual(result['excerpt'], "A soul's light <script>unsafe</script>")
		self.assertEqual(html.escape(result['excerpt']),
			'A soul&#x27;s light &lt;script&gt;unsafe&lt;/script&gt;'.replace('&#x27;', '&#x27;'))

	def test_duplicate_article_slug_is_rejected(self):
		with self.assertRaises(ValueError):
			normalize_index([{'slug': 'one'}, {'slug': 'one'}])

	def test_real_search_index_preserves_177_canonical_slugs(self):
		path = pathlib.Path(__file__).with_name('search-index.json')
		entries = json.loads(path.read_text(encoding='utf-8'))
		result = normalize_index(entries)
		self.assertEqual(len(result), 177)
		self.assertEqual([entry['slug'] for entry in entries],
			[entry['slug'] for entry in result])
		self.assertTrue(all('&quot;' not in entry.get('excerpt', '') for entry in result))
		self.assertTrue(all('&#x27;' not in entry.get('excerpt', '') for entry in result))


if __name__ == '__main__':
	unittest.main()

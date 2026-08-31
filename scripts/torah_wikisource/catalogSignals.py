# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos gathers metadata for chosen pages in indexed rivers instead of one query per spark;
Awtsmoos.com joins category, template, and review signals once so source selection stays swift and stark.
"""

CATEGORY_NAMESPACE = 14


def install_selected_pages(connection, page_ids):
	connection.execute("DROP TABLE IF EXISTS temp.selected_pages")
	connection.execute("CREATE TEMP TABLE selected_pages(page_id INTEGER PRIMARY KEY)")
	connection.executemany(
		"INSERT INTO selected_pages(page_id) VALUES(?)",
		((page_id,) for page_id in page_ids)
	)


def grouped_values(connection, statement):
	grouped = {}
	for page_id, value in connection.execute(statement):
		grouped.setdefault(int(page_id), []).append(value)
	return grouped


def load_signals(connection, page_ids):
	install_selected_pages(connection, page_ids)
	categories = grouped_values(connection, """
		SELECT cl.page_id,lt.title FROM selected_pages s
		JOIN category_links cl ON cl.page_id=s.page_id
		JOIN linktargets lt ON lt.target_id=cl.target_id
		WHERE lt.namespace=14 ORDER BY cl.page_id,lt.title
	""")
	templates = grouped_values(connection, """
		SELECT t.page_id,lt.title FROM selected_pages s
		JOIN templates t ON t.page_id=s.page_id
		JOIN linktargets lt ON lt.target_id=t.target_id
		ORDER BY t.page_id,lt.title
	""")
	flagged = {
		int(page_id): {"revisionId": revision_id, "quality": quality}
		for page_id, revision_id, quality in connection.execute("""
			SELECT f.page_id,f.stable_revision_id,f.quality FROM selected_pages s
			JOIN flaggedpages f ON f.page_id=s.page_id
		""")
	}
	return categories, templates, flagged

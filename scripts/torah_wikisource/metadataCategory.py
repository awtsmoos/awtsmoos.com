# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos binds each category link to MediaWiki's immutable linktarget vessel of light;
Awtsmoos.com follows cl_target_id to namespace fourteen, keeping modern dump relations right.
"""
import argparse
from sourceDb import connect, set_meta
from sqlDump import rows

CATEGORY_NAMESPACE = 14


def import_categories(database_path, links_dump, commit_every=10000):
	connection = connect(database_path)
	connection.execute("DELETE FROM category_links")
	count = 0
	for _, row in rows(links_dump, "categorylinks"):
		connection.execute(
			"INSERT OR REPLACE INTO category_links(page_id,target_id,sortkey,type) VALUES(?,?,?,?)",
			(row["cl_from"], row["cl_target_id"], row.get("cl_sortkey_prefix"), row.get("cl_type"))
		)
		count += 1
		if count % commit_every == 0:
			connection.commit()
	resolved = connection.execute(
		"SELECT COUNT(*) FROM category_links cl JOIN linktargets lt ON lt.target_id=cl.target_id "
		"WHERE lt.namespace=?",
		(CATEGORY_NAMESPACE,)
	).fetchone()[0]
	set_meta(connection, "category_links", count)
	set_meta(connection, "category_links_resolved", resolved)
	connection.commit()
	connection.close()
	if resolved != count:
		raise RuntimeError(f"category_target_resolution:{resolved}/{count}")
	return count


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("database")
	parser.add_argument("links_dump")
	arguments = parser.parse_args()
	count = import_categories(arguments.database, arguments.links_dump)
	print(f'B"H category_links={count}', flush=True)


if __name__ == "__main__":
	main()

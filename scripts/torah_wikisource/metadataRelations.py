# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos binds redirects, template targets, and review signals back to each source page;
Awtsmoos.com preserves current dump column names so provenance survives every metadata stage.
"""
import argparse
from sourceDb import connect, set_meta
from sqlDump import rows


def import_table(connection, path, table, statement, converter, clear_table, commit_every=10000):
	connection.execute(f"DELETE FROM {clear_table}")
	count = 0
	for _, row in rows(path, table):
		values = converter(row)
		if values[0] is None:
			continue
		connection.execute(statement, values)
		count += 1
		if count % commit_every == 0:
			connection.commit()
	set_meta(connection, f"metadata_{table}", count)
	connection.commit()
	return count


def import_relations(database_path, root):
	connection = connect(database_path)
	jobs = [
		("redirect", "redirects", "INSERT OR REPLACE INTO redirects VALUES(?,?,?,?)",
		 lambda r: (r["rd_from"], r["rd_namespace"], r["rd_title"], r.get("rd_fragment"))),
		("linktarget", "linktargets", "INSERT OR REPLACE INTO linktargets VALUES(?,?,?)",
		 lambda r: (r["lt_id"], r["lt_namespace"], r["lt_title"])),
		("templatelinks", "templates", "INSERT OR REPLACE INTO templates VALUES(?,?)",
		 lambda r: (r["tl_from"], r["tl_target_id"])),
		("flaggedpages", "flaggedpages", "INSERT OR REPLACE INTO flaggedpages VALUES(?,?,?,?)",
		 lambda r: (r["fp_page_id"], r.get("fp_reviewed"), r["fp_stable"], r.get("fp_quality"))),
		("flaggedrevs", "flaggedrevs", "INSERT OR REPLACE INTO flaggedrevs VALUES(?,?,?,?)",
		 lambda r: (r["fr_rev_id"], r["fr_page_id"], r["fr_quality"], r.get("fr_tags")))
	]
	counts = {}
	for table, clear_table, statement, converter in jobs:
		path = f"{root}/hewikisource-20260801-{table}.sql.gz"
		counts[table] = import_table(connection, path, table, statement, converter, clear_table)
	connection.close()
	return counts


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("database")
	parser.add_argument("dump_root")
	arguments = parser.parse_args()
	counts = import_relations(arguments.database, arguments.dump_root)
	print(f'B"H metadata={counts}', flush=True)


if __name__ == "__main__":
	main()

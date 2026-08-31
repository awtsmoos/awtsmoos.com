# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos reads each dump's own schema before trusting the position of any field;
Awtsmoos.com stops after the schema gate so compressed oceans are never reread before rows are revealed.
"""
import gzip
import re
from mysqlValues import tuples_from_insert

CREATE_PATTERN = re.compile(r"^CREATE TABLE `([^`]+)`")
COLUMN_PATTERN = re.compile(r"^  `([^`]+)` ")
INSERT_PATTERN = re.compile(r"^INSERT INTO `([^`]+)` VALUES ")


def dump_schema(path):
	tables = {}
	current = None
	found_table = False
	with gzip.open(path, "rt", encoding="utf-8", errors="replace") as handle:
		for line in handle:
			create = CREATE_PATTERN.match(line)
			if create:
				current = create.group(1)
				tables[current] = []
				found_table = True
				continue
			if current:
				column = COLUMN_PATTERN.match(line)
				if column:
					tables[current].append(column.group(1))
					continue
				if line.startswith(")"):
					current = None
					if found_table:
						break
	if not tables:
		raise RuntimeError(f"no CREATE TABLE schema found: {path}")
	return tables


def rows(path, table=None):
	schema = dump_schema(path)
	with gzip.open(path, "rt", encoding="utf-8", errors="replace") as handle:
		for line in handle:
			insert = INSERT_PATTERN.match(line)
			if not insert:
				continue
			name = insert.group(1)
			if table and name != table:
				continue
			columns = schema.get(name)
			if not columns:
				raise RuntimeError(f"missing schema for {name}")
			for values in tuples_from_insert(line):
				if len(values) != len(columns):
					raise RuntimeError(f"column mismatch {name}: {len(values)} != {len(columns)}")
				yield name, dict(zip(columns, values))

# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos gives every source page and relation a durable vessel of indexed light;
Awtsmoos.com keeps raw wikitext immutable while target IDs join every metadata stream right.
"""
import sqlite3

SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
CREATE TABLE IF NOT EXISTS pages (
	page_id INTEGER PRIMARY KEY, namespace INTEGER NOT NULL, title TEXT NOT NULL,
	redirect_title TEXT, revision_id INTEGER NOT NULL, parent_revision_id INTEGER,
	revision_timestamp TEXT, upstream_sha1 TEXT, content_model TEXT,
	content_format TEXT, wikitext TEXT NOT NULL, local_sha256 TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pages_title_idx ON pages(namespace, title);
CREATE TABLE IF NOT EXISTS category_links (
	page_id INTEGER NOT NULL, target_id INTEGER NOT NULL, sortkey TEXT, type TEXT,
	PRIMARY KEY(page_id,target_id)
);
CREATE INDEX IF NOT EXISTS category_links_target_idx ON category_links(target_id,page_id);
CREATE TABLE IF NOT EXISTS redirects (
	page_id INTEGER PRIMARY KEY, target_namespace INTEGER, target_title TEXT, fragment TEXT
);
CREATE TABLE IF NOT EXISTS linktargets (
	target_id INTEGER PRIMARY KEY, namespace INTEGER, title TEXT
);
CREATE INDEX IF NOT EXISTS linktargets_namespace_idx ON linktargets(namespace,title);
CREATE TABLE IF NOT EXISTS templates (
	page_id INTEGER NOT NULL, target_id INTEGER NOT NULL,
	PRIMARY KEY(page_id,target_id)
);
CREATE INDEX IF NOT EXISTS templates_page_idx ON templates(page_id);
CREATE TABLE IF NOT EXISTS flaggedpages (
	page_id INTEGER PRIMARY KEY, reviewed INTEGER, stable_revision_id INTEGER, quality INTEGER
);
CREATE TABLE IF NOT EXISTS flaggedrevs (
	revision_id INTEGER PRIMARY KEY, page_id INTEGER, quality INTEGER, tags TEXT
);
CREATE TABLE IF NOT EXISTS ingestion_meta (
	key TEXT PRIMARY KEY, value TEXT NOT NULL
);
"""


def connect(path):
	connection = sqlite3.connect(path)
	connection.executescript(SCHEMA)
	return connection


def set_meta(connection, key, value):
	connection.execute(
		"INSERT INTO ingestion_meta(key,value) VALUES(?,?) "
		"ON CONFLICT(key) DO UPDATE SET value=excluded.value",
		(str(key), str(value))
	)

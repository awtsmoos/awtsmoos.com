/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_HTML_H
#define AWTS_MERKAVA_HTML_H

#include <stddef.h>
#include <stdint.h>

/*
 * Minimal HTML tokenizer -> document model for the native browser.
 *
 * Pure C, no platform dependencies: host-testable with gcc.
 * This is NOT a full HTML5 parser. It handles real-world pages
 * well enough to extract readable text:
 * - comments, doctype, CDATA skipped
 * - <script>/<style>/<noscript> subtrees skipped
 * - block tags (h1-h6, p, div, li, pre, blockquote, hr, br) break blocks
 * - <a href> captured as link blocks (inline links split the text run)
 * - <title> captured
 * - entities decoded (&amp; &lt; &gt; &quot; &#39; &#x2F; etc.)
 * - malformed markup tolerated (unclosed tags, stray text)
 */

typedef enum {
	AWTS_HTML_TEXT = 0,   /* plain paragraph-ish text run */
	AWTS_HTML_HEADING = 1,/* h1..h6, level in `level` */
	AWTS_HTML_ITEM = 2,   /* <li> */
	AWTS_HTML_PRE = 3,    /* <pre>: whitespace preserved */
	AWTS_HTML_LINK = 4,   /* <a href>: text + href */
	AWTS_HTML_HR = 5      /* <hr>: no text */
} AwtsHtmlBlockKind;

typedef struct {
	AwtsHtmlBlockKind kind;
	int level;      /* heading level 1..6 (HEADING only) */
	char tag[16];   /* element tag ("p", "div", "h1", "a", ...) */
	char* text;     /* owned, entity-decoded, NUL-terminated */
	char* href;     /* owned or NULL (LINK only) */
	char* cls;      /* class attribute (owned or NULL) */
	char* id;       /* id attribute (owned or NULL) */
	char* style;    /* inline style="" (owned or NULL) */
} AwtsHtmlBlock;

typedef struct {
	char* title;          /* owned, may be NULL */
	char* css;            /* concatenated <style> text (owned or NULL) */
	AwtsHtmlBlock* blocks;
	size_t blockCount;
	size_t blockCap;
} AwtsHtmlDoc;

/** Parses HTML bytes into a document. Returns 1 on success. */
int awts_html_parse(const char* html, size_t len, AwtsHtmlDoc* out);

/** Frees all document memory. */
void awts_html_free(AwtsHtmlDoc* doc);

/**
 * Resolves a possibly-relative reference against a base URL.
 * Handles absolute URLs, //host/path, /root/path, relative/path,
 * and #fragment / ?query on the base. Result NUL-terminated in out.
 */
void awts_url_resolve(const char* base, const char* ref,
	char* out, size_t cap);

/** Returns 1 if the URL uses http or https. */
int awts_url_is_http(const char* url);

#endif

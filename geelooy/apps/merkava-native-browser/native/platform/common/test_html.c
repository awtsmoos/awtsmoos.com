/*B"H - host test for merkava_html.c (gcc, no Android needed) */
#include <stdio.h>
#include <string.h>
#include "merkava_html.h"

static int failures = 0;
#define CHECK(cond, msg) do { \
	if (!(cond)) { printf("FAIL: %s\n", msg); failures++; } \
} while (0)

int main(void) {
	/* 1. Basic structure. */
	{
		const char* html =
			"<!doctype html><html><head><title>Example Domain</title>"
			"<style>body{color:red}</style>"
			"<script>var x = '<p>fake</p>';</script></head>"
			"<body><h1>Example Domain</h1>"
			"<p>This domain is for use in <a href=\"/more\">illustrative</a> "
			"examples &amp; docs.</p>"
			"<!-- a comment --><ul><li>one</li><li>two</li></ul>"
			"<p>Unclosed paragraph<div>div text</div></body></html>";
		AwtsHtmlDoc doc;
		CHECK(awts_html_parse(html, strlen(html), &doc), "parse ok");
		CHECK(doc.title && strcmp(doc.title, "Example Domain") == 0,
			"title extracted");
		int sawH1 = 0, sawLink = 0, sawLi = 0, sawEntity = 0, sawDiv = 0;
		int sawScript = 0;
		for (size_t i = 0; i < doc.blockCount; i++) {
			AwtsHtmlBlock* b = &doc.blocks[i];
			if (b->kind == AWTS_HTML_HEADING && b->level == 1
				&& b->text && strstr(b->text, "Example Domain")) sawH1 = 1;
			if (b->kind == AWTS_HTML_LINK && b->href
				&& strcmp(b->href, "/more") == 0
				&& b->text && strstr(b->text, "illustrative")) sawLink = 1;
			if (b->kind == AWTS_HTML_ITEM && b->text
				&& (strstr(b->text, "one") || strstr(b->text, "two")))
				sawLi++;
			if (b->text && strstr(b->text, "examples & docs")) sawEntity = 1;
			if (b->text && strstr(b->text, "div text")) sawDiv = 1;
			if (b->text && strstr(b->text, "fake")) sawScript = 1;
		}
		CHECK(sawH1, "h1 block");
		CHECK(sawLink, "link block with href");
		CHECK(sawLi == 2, "two li blocks");
		CHECK(sawEntity, "entity decoded");
		CHECK(sawDiv, "div text after unclosed p");
		CHECK(!sawScript, "script content skipped");
		printf("blocks=%zu\n", doc.blockCount);
		awts_html_free(&doc);
	}

	/* 2. URL resolution. */
	{
		char out[512];
		awts_url_resolve("https://example.com/a/b/c.html", "../d.html",
			out, sizeof(out));
		CHECK(strcmp(out, "https://example.com/a/d.html") == 0,
			"relative .. resolve");
		awts_url_resolve("https://example.com/a/b/", "/root/x",
			out, sizeof(out));
		CHECK(strcmp(out, "https://example.com/root/x") == 0,
			"root-relative resolve");
		awts_url_resolve("https://example.com/a/", "https://other.com/y",
			out, sizeof(out));
		CHECK(strcmp(out, "https://other.com/y") == 0, "absolute passthrough");
		awts_url_resolve("https://example.com/a/b.html", "#frag",
			out, sizeof(out));
		CHECK(strcmp(out, "https://example.com/a/b.html#frag") == 0,
			"fragment resolve");
		CHECK(awts_url_is_http("https://example.com/"), "is_http https");
		CHECK(!awts_url_is_http("javascript:void(0)"), "is_http rejects js");
	}

	/* 3. Entities incl. numeric. */
	{
		const char* html = "<p>A&#65;B&#x42;C&lt;D&gt;E&quot;F&#39;G</p>";
		AwtsHtmlDoc doc;
		awts_html_parse(html, strlen(html), &doc);
		int ok = doc.blockCount == 1 && doc.blocks[0].text
			&& strcmp(doc.blocks[0].text, "AABBC<D>E\"F'G") == 0;
		/* A&#65;(=A)B&#x42;(=B)C -> "AABBC<D>E\"F'G" */
		CHECK(ok, "numeric entities");
		if (!ok && doc.blockCount)
			printf("  got: [%s]\n", doc.blocks[0].text);
		awts_html_free(&doc);
	}

	if (failures == 0) printf("HTML_PARSER_TESTS_PASS\n");
	else printf("HTML_PARSER_TESTS_FAIL n=%d\n", failures);
	return failures != 0;
}

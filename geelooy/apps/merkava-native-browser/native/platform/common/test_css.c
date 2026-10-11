/*B"H - host test for merkava_css.c */
#include <stdio.h>
#include <string.h>
#include "merkava_css.h"

static int failures = 0;
#define CHECK(cond, msg) do { \
	if (!(cond)) { printf("FAIL: %s\n", msg); failures++; } \
} while (0)
#define FEQ(a, b) ((a) > (b) - 0.01f && (a) < (b) + 0.01f)

int main(void) {
	{
		const char* css =
			"/* comment */ h1 { color: #ff0000; font-size: 32px; } "
			".lead { color: blue; text-align: center; } "
			"#main { background-color: rgb(0,255,0); margin: 10px 20px; } "
			"div p { font-weight: bold; } "
			"@media x { p { color: pink; } } "
			".hide { display: none; }";
		AwtsCssSheet sheet;
		CHECK(awts_css_parse(css, &sheet), "parse ok");
		printf("rules=%d\n", sheet.ruleCount);
		CHECK(sheet.ruleCount == 5, "5 rules (@media skipped)");

		AwtsCssComputed c;
		awts_css_compute(&sheet, "h1", NULL, NULL, NULL, &c);
		CHECK(c.hasColor && FEQ(c.color[0], 1.0f)
			&& FEQ(c.color[1], 0.0f), "h1 color red");
		CHECK(FEQ(c.fontPx, 32.0f), "h1 font-size 32px");

		awts_css_compute(&sheet, "p", "lead", NULL, NULL, &c);
		CHECK(c.hasColor && FEQ(c.color[2], 1.0f), "lead blue");
		CHECK(c.align == AWTS_CSS_ALIGN_CENTER, "lead centered");
		CHECK(c.bold == 1, "div p descendant bold");

		awts_css_compute(&sheet, "div", NULL, "main", NULL, &c);
		CHECK(c.hasBg && FEQ(c.bg[1], 1.0f), "main bg green");
		CHECK(FEQ(c.margin[0], 10.0f) && FEQ(c.margin[1], 20.0f),
			"margin 10px 20px");

		awts_css_compute(&sheet, "p", "hide", NULL, NULL, &c);
		CHECK(c.displayNone, "display none");

		/* Inline style beats stylesheet. */
		awts_css_compute(&sheet, "p", "lead", NULL,
			"color: #00ff00; font-size: 99px;", &c);
		CHECK(c.hasColor && FEQ(c.color[1], 1.0f), "inline green wins");
		CHECK(FEQ(c.fontPx, 99.0f), "inline 99px wins");

		awts_css_free(&sheet);
	}
	{
		/* em/%/keyword sizes + named colors. */
		AwtsCssDecl d[8];
		int n = awts_css_parse_decls(
			"font-size: 2em; color: navy; margin-top: 5px;", d, 8);
		CHECK(n == 3, "3 decls");
		CHECK(FEQ(d[0].px, 32.0f), "2em = 32px");
		CHECK(FEQ(d[1].color[2], 0.5f), "navy");
		CHECK(FEQ(d[2].box[0], 5.0f), "margin-top 5px");
	}
	if (failures == 0) printf("CSS_PARSER_TESTS_PASS\n");
	else printf("CSS_PARSER_TESTS_FAIL n=%d\n", failures);
	return failures != 0;
}

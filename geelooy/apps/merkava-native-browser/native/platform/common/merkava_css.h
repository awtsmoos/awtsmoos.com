/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_CSS_H
#define AWTS_MERKAVA_CSS_H

#include <stddef.h>

/*
 * CSS subset parser + cascade for the native browser (v2).
 *
 * Pure C, no platform dependencies: host-testable with gcc.
 * Supported:
 * - selectors: tag, .class, #id, tag.class, descendant chains
 *   (ancestor parts are ignored — the block model is flat), comma groups
 * - declarations: color, background-color, font-size, font-weight,
 *   text-align, margin, padding (1-4 values), display
 * - values: #rgb/#rrggbb, rgb(), named colors, px/em/%/pt, keywords
 * - specificity: id=100, class=10, tag=1; inline style wins
 * - <style> blocks and inline style="" attributes
 *
 * NOT supported: pseudo-classes, attribute selectors, @media, !important,
 * floats, positioning, flex/grid. Documented as v2 limits.
 */

typedef enum {
	AWTS_CSS_COLOR = 0,
	AWTS_CSS_BACKGROUND_COLOR,
	AWTS_CSS_FONT_SIZE,
	AWTS_CSS_FONT_WEIGHT,
	AWTS_CSS_TEXT_ALIGN,
	AWTS_CSS_MARGIN,
	AWTS_CSS_PADDING,
	AWTS_CSS_DISPLAY
} AwtsCssProp;

/* text-align values */
#define AWTS_CSS_ALIGN_LEFT 0
#define AWTS_CSS_ALIGN_CENTER 1
#define AWTS_CSS_ALIGN_RIGHT 2
/* display values */
#define AWTS_CSS_DISPLAY_BLOCK 0
#define AWTS_CSS_DISPLAY_NONE 1
#define AWTS_CSS_DISPLAY_INLINE 2

typedef struct {
	AwtsCssProp prop;
	float color[3];   /* COLOR / BACKGROUND_COLOR */
	float px;         /* FONT_SIZE (px) */
	float box[4];     /* MARGIN / PADDING: top right bottom left (px) */
	int ival;         /* FONT_WEIGHT (0/1), TEXT_ALIGN, DISPLAY */
} AwtsCssDecl;

typedef struct {
	int isId;
	int isClass;
	char tag[32];     /* empty = universal for this part */
	char name[64];    /* id or class name */
} AwtsCssSimpleSel;

typedef struct {
	AwtsCssSimpleSel target; /* rightmost part (what we match) */
	int specificity;
} AwtsCssSelector;

typedef struct {
	AwtsCssSelector sels[8];
	int selCount;
	AwtsCssDecl decls[24];
	int declCount;
} AwtsCssRule;

typedef struct {
	AwtsCssRule* rules;
	int ruleCount;
	int ruleCap;
} AwtsCssSheet;

int awts_css_parse(const char* css, AwtsCssSheet* out);
void awts_css_free(AwtsCssSheet* sheet);

/** Parses an inline style="..." into decls. Returns decl count. */
int awts_css_parse_decls(const char* style, AwtsCssDecl* out, int cap);

/* Computed style for one block. */
typedef struct {
	float color[3];
	int hasColor;
	float bg[3];
	int hasBg;
	float fontPx;     /* 0 = use default */
	int bold;         /* 0/1 */
	int align;        /* AWTS_CSS_ALIGN_* */
	float margin[4];
	float padding[4];
	int displayNone;
} AwtsCssComputed;

void awts_css_computed_init(AwtsCssComputed* c);

/**
 * Computes the cascaded style for a block.
 * tag: element tag ("p", "h1", "div", "a", "li"...) — never NULL.
 */
void awts_css_compute(const AwtsCssSheet* sheet, const char* tag,
	const char* cls, const char* id, const char* inlineStyle,
	AwtsCssComputed* out);

#endif

/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_css.h"

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <ctype.h>
#include <strings.h>

/* ------------------------------------------------------------------ */
/* Value parsing.                                                      */
/* ------------------------------------------------------------------ */

static int hex_digit(char c) {
	if (c >= '0' && c <= '9') return c - '0';
	if (c >= 'a' && c <= 'f') return c - 'a' + 10;
	if (c >= 'A' && c <= 'F') return c - 'A' + 10;
	return -1;
}

static int parse_hex_color(const char* s, float out[3]) {
	if (*s == '#') s++;
	size_t n = 0;
	while (hex_digit(s[n]) >= 0) n++;
	int v[3] = { 0, 0, 0 };
	if (n == 3) {
		for (int i = 0; i < 3; i++)
			v[i] = hex_digit(s[i]) * 17;
	} else if (n == 6) {
		for (int i = 0; i < 3; i++)
			v[i] = hex_digit(s[i * 2]) * 16 + hex_digit(s[i * 2 + 1]);
	} else {
		return 0;
	}
	for (int i = 0; i < 3; i++) out[i] = v[i] / 255.0f;
	return 1;
}

typedef struct { const char* name; float rgb[3]; } AwtsNamedColor;
static const AwtsNamedColor AWTS_NAMED[] = {
	{ "black", { 0, 0, 0 } }, { "white", { 1, 1, 1 } },
	{ "red", { 1, 0, 0 } }, { "green", { 0, 0.5f, 0 } },
	{ "blue", { 0, 0, 1 } }, { "yellow", { 1, 1, 0 } },
	{ "gray", { 0.5f, 0.5f, 0.5f } }, { "grey", { 0.5f, 0.5f, 0.5f } },
	{ "silver", { 0.75f, 0.75f, 0.75f } },
	{ "maroon", { 0.5f, 0, 0 } }, { "olive", { 0.5f, 0.5f, 0 } },
	{ "lime", { 0, 1, 0 } }, { "aqua", { 0, 1, 1 } },
	{ "teal", { 0, 0.5f, 0.5f } }, { "navy", { 0, 0, 0.5f } },
	{ "fuchsia", { 1, 0, 1 } }, { "purple", { 0.5f, 0, 0.5f } },
	{ "orange", { 1, 0.65f, 0 } }, { "pink", { 1, 0.75f, 0.8f } },
	{ "brown", { 0.65f, 0.16f, 0.16f } },
	{ "gold", { 1, 0.84f, 0 } }, { "darkblue", { 0, 0, 0.55f } },
	{ "darkred", { 0.55f, 0, 0 } }, { "lightgray", { 0.83f, 0.83f, 0.83f } },
	{ "lightgrey", { 0.83f, 0.83f, 0.83f } },
	{ "darkgray", { 0.66f, 0.66f, 0.66f } },
	{ "darkgrey", { 0.66f, 0.66f, 0.66f } },
	{ "transparent", { 0, 0, 0 } },
	{ NULL, { 0, 0, 0 } }
};

static int parse_color(const char* s, float out[3]) {
	while (isspace((unsigned char)*s)) s++;
	if (*s == '#') return parse_hex_color(s, out);
	if (strncasecmp(s, "rgb(", 4) == 0) {
		int r = 0, g = 0, b = 0;
		if (sscanf(s + 4, "%d,%d,%d", &r, &g, &b) == 3
			|| sscanf(s + 4, "%d ,%d ,%d", &r, &g, &b) == 3) {
			out[0] = r / 255.0f; out[1] = g / 255.0f;
			out[2] = b / 255.0f;
			return 1;
		}
		return 0;
	}
	char name[32];
	size_t i = 0;
	while (i + 1 < sizeof(name) && s[i]
		&& !isspace((unsigned char)s[i]) && s[i] != ';'
		&& s[i] != '!') {
		name[i] = (char)tolower((unsigned char)s[i]);
		i++;
	}
	name[i] = 0;
	for (int k = 0; AWTS_NAMED[k].name; k++) {
		if (strcmp(name, AWTS_NAMED[k].name) == 0) {
			out[0] = AWTS_NAMED[k].rgb[0];
			out[1] = AWTS_NAMED[k].rgb[1];
			out[2] = AWTS_NAMED[k].rgb[2];
			return 1;
		}
	}
	return 0;
}

/* Parses a length; returns px (em*16, % of 16, pt*1.33). -1 on failure. */
static float parse_length(const char* s) {
	while (isspace((unsigned char)*s)) s++;
	char* e = NULL;
	float v = strtof(s, &e);
	if (e == s) {
		/* Keywords. */
		if (strncasecmp(s, "small", 5) == 0) return 13;
		if (strncasecmp(s, "medium", 6) == 0) return 16;
		if (strncasecmp(s, "large", 5) == 0) return 18;
		if (strncasecmp(s, "x-large", 7) == 0) return 24;
		if (strncasecmp(s, "xx-large", 8) == 0) return 32;
		if (strncasecmp(s, "larger", 6) == 0) return 19;
		if (strncasecmp(s, "smaller", 7) == 0) return 13;
		return -1;
	}
	while (isspace((unsigned char)*e)) e++;
	if (strncmp(e, "px", 2) == 0) return v;
	if (*e == '%') return v * 16.0f / 100.0f;
	if (strncmp(e, "em", 2) == 0) return v * 16.0f;
	if (strncmp(e, "pt", 2) == 0) return v * 1.333f;
	if (*e == 0 || *e == ';') return v; /* bare number = px */
	return -1;
}

static int prop_id(const char* name, size_t n) {
	char tmp[32];
	if (n >= sizeof(tmp)) return -1;
	for (size_t i = 0; i < n; i++)
		tmp[i] = (char)tolower((unsigned char)name[i]);
	tmp[n] = 0;
	if (strcmp(tmp, "color") == 0) return AWTS_CSS_COLOR;
	if (strcmp(tmp, "background-color") == 0)
		return AWTS_CSS_BACKGROUND_COLOR;
	if (strcmp(tmp, "background") == 0) return AWTS_CSS_BACKGROUND_COLOR;
	if (strcmp(tmp, "font-size") == 0) return AWTS_CSS_FONT_SIZE;
	if (strcmp(tmp, "font-weight") == 0) return AWTS_CSS_FONT_WEIGHT;
	if (strcmp(tmp, "text-align") == 0) return AWTS_CSS_TEXT_ALIGN;
	if (strcmp(tmp, "margin") == 0) return AWTS_CSS_MARGIN;
	if (strcmp(tmp, "margin-top") == 0) return AWTS_CSS_MARGIN;
	if (strcmp(tmp, "padding") == 0) return AWTS_CSS_PADDING;
	if (strcmp(tmp, "display") == 0) return AWTS_CSS_DISPLAY;
	return -1;
}

/* Parses one "prop: value" declaration. Returns 1 if recognized. */
static int parse_one_decl(const char* name, size_t nl,
	const char* val, size_t vl, AwtsCssDecl* out) {
	int id = prop_id(name, nl);
	if (id < 0) return 0;
	char vbuf[256];
	if (vl >= sizeof(vbuf)) vl = sizeof(vbuf) - 1;
	memcpy(vbuf, val, vl);
	vbuf[vl] = 0;
	/* Strip leading whitespace. */
	char* vs = vbuf;
	while (*vs && isspace((unsigned char)*vs)) vs++;
	/* Strip trailing whitespace/semicolons. */
	while (vl > 0 && (isspace((unsigned char)vbuf[vl - 1])
		|| vbuf[vl - 1] == ';')) {
		vbuf[--vl] = 0;
	}
	memset(out, 0, sizeof(*out));
	out->prop = (AwtsCssProp)id;
	switch (id) {
	case AWTS_CSS_COLOR:
	case AWTS_CSS_BACKGROUND_COLOR:
		if (!parse_color(vs, out->color)) return 0;
		break;
	case AWTS_CSS_FONT_SIZE: {
		float px = parse_length(vs);
		if (px < 0) return 0;
		out->px = px;
		break;
	}
	case AWTS_CSS_FONT_WEIGHT:
		out->ival = (strcasecmp(vs, "bold") == 0
			|| atoi(vs) >= 600) ? 1 : 0;
		break;
	case AWTS_CSS_TEXT_ALIGN:
		if (strcasecmp(vs, "center") == 0)
			out->ival = AWTS_CSS_ALIGN_CENTER;
		else if (strcasecmp(vs, "right") == 0)
			out->ival = AWTS_CSS_ALIGN_RIGHT;
		else out->ival = AWTS_CSS_ALIGN_LEFT;
		break;
	case AWTS_CSS_MARGIN: {
		/* margin-top only for the -top variant. */
		int topOnly = (nl == 10); /* "margin-top" */
		float vals[4] = { 0, 0, 0, 0 };
		int nv = 0;
		const char* q = vs;
		while (*q && nv < 4) {
			while (isspace((unsigned char)*q)) q++;
			if (!*q) break;
			float px = parse_length(q);
			if (px < 0) break;
			vals[nv++] = px;
			while (*q && !isspace((unsigned char)*q)) q++;
		}
		if (topOnly) {
			if (nv < 1) return 0;
			out->box[0] = vals[0];
		} else {
			if (nv == 1) {
				vals[1] = vals[2] = vals[3] = vals[0];
			} else if (nv == 2) {
				vals[2] = vals[0]; vals[3] = vals[1];
			} else if (nv == 3) {
				vals[3] = vals[1];
			} else if (nv == 0) {
				return 0;
			}
			memcpy(out->box, vals, sizeof(vals));
		}
		break;
	}
	case AWTS_CSS_PADDING: {
		float vals[4] = { 0, 0, 0, 0 };
		int nv = 0;
		const char* q = vs;
		while (*q && nv < 4) {
			while (isspace((unsigned char)*q)) q++;
			if (!*q) break;
			float px = parse_length(q);
			if (px < 0) break;
			vals[nv++] = px;
			while (*q && !isspace((unsigned char)*q)) q++;
		}
		if (nv == 1) vals[1] = vals[2] = vals[3] = vals[0];
		else if (nv == 2) { vals[2] = vals[0]; vals[3] = vals[1]; }
		else if (nv == 3) vals[3] = vals[1];
		else if (nv == 0) return 0;
		memcpy(out->box, vals, sizeof(vals));
		break;
	}
	case AWTS_CSS_DISPLAY:
		if (strcasecmp(vs, "none") == 0)
			out->ival = AWTS_CSS_DISPLAY_NONE;
		else if (strcasecmp(vs, "inline") == 0)
			out->ival = AWTS_CSS_DISPLAY_INLINE;
		else out->ival = AWTS_CSS_DISPLAY_BLOCK;
		break;
	}
	return 1;
}

int awts_css_parse_decls(const char* style, AwtsCssDecl* out, int cap) {
	int n = 0;
	if (!style || !out || cap <= 0) return 0;
	const char* p = style;
	while (*p && n < cap) {
		while (isspace((unsigned char)*p)) p++;
		if (!*p) break;
		const char* ns = p;
		while (*p && *p != ':' && *p != ';' && *p != '}') p++;
		if (*p != ':') {
			while (*p && *p != ';') p++;
			if (*p == ';') p++;
			continue;
		}
		size_t nl = (size_t)(p - ns);
		while (nl > 0 && isspace((unsigned char)ns[nl - 1])) nl--;
		p++; /* ':' */
		const char* vs = p;
		while (*p && *p != ';' && *p != '}') p++;
		size_t vl = (size_t)(p - vs);
		if (*p == ';') p++;
		AwtsCssDecl d;
		if (parse_one_decl(ns, nl, vs, vl, &d))
			out[n++] = d;
	}
	return n;
}

/* ------------------------------------------------------------------ */
/* Selectors + cascade.                                                */
/* ------------------------------------------------------------------ */

static void parse_simple(const char* s, size_t n, AwtsCssSimpleSel* out,
	int* spec) {
	memset(out, 0, sizeof(*out));
	size_t i = 0;
	while (i < n) {
		if (s[i] == '#') {
			out->isId = 1;
			i++;
			size_t k = 0;
			while (i < n && k + 1 < sizeof(out->name)
				&& (isalnum((unsigned char)s[i])
					|| s[i] == '-' || s[i] == '_'))
				out->name[k++] = s[i++];
			out->name[k] = 0;
			*spec += 100;
		} else if (s[i] == '.') {
			out->isClass = 1;
			i++;
			size_t k = strlen(out->name);
			/* Keep first class name only (v2 limit). */
			if (k == 0) {
				while (i < n && k + 1 < sizeof(out->name)
					&& (isalnum((unsigned char)s[i])
						|| s[i] == '-' || s[i] == '_'))
					out->name[k++] = s[i++];
				out->name[k] = 0;
			} else {
				while (i < n && (isalnum((unsigned char)s[i])
					|| s[i] == '-' || s[i] == '_')) i++;
			}
			*spec += 10;
		} else if (s[i] == '*') {
			i++;
		} else if (isalpha((unsigned char)s[i])) {
			size_t k = 0;
			while (i < n && k + 1 < sizeof(out->tag)
				&& (isalnum((unsigned char)s[i]) || s[i] == '-'))
				out->tag[k++] = (char)tolower(
					(unsigned char)s[i++]);
			out->tag[k] = 0;
			*spec += 1;
		} else {
			i++;
		}
	}
}

/* Takes the rightmost compound of a complex selector. */
static void parse_selector(const char* s, size_t n, AwtsCssSelector* out) {
	memset(out, 0, sizeof(*out));
	/* Find last combinator/space: target is the tail. */
	size_t end = n;
	while (end > 0 && isspace((unsigned char)s[end - 1])) end--;
	size_t start = end;
	while (start > 0 && !isspace((unsigned char)s[start - 1])
		&& s[start - 1] != '>' && s[start - 1] != '+'
		&& s[start - 1] != '~')
		start--;
	/* Specificity counts ALL parts (approx: scan whole selector). */
	int spec = 0;
	for (size_t i = 0; i < n; i++) {
		if (s[i] == '#') spec += 100;
		else if (s[i] == '.') spec += 10;
	}
	/* Tag points: count tag names (alpha runs not after #/.). */
	for (size_t i = 0; i < n; i++) {
		if (isalpha((unsigned char)s[i])
			&& (i == 0 || (s[i - 1] != '#' && s[i - 1] != '.'
				&& s[i - 1] != '-'))) {
			int j = (int)i - 1;
			while (j >= 0 && (isalnum((unsigned char)s[j])
				|| s[j] == '-')) j--;
			if (j < (int)i - 1 || !isalpha((unsigned char)s[i]))
				continue;
			spec += 1;
			while (i < n && (isalnum((unsigned char)s[i])
				|| s[i] == '-')) i++;
		}
	}
	parse_simple(s + start, end - start, &out->target, &spec);
	out->specificity = spec;
}

static int rule_add(AwtsCssSheet* sheet, const AwtsCssRule* r) {
	if (sheet->ruleCount >= sheet->ruleCap) {
		int next = sheet->ruleCap ? sheet->ruleCap * 2 : 32;
		AwtsCssRule* nr = (AwtsCssRule*)realloc(sheet->rules,
			(size_t)next * sizeof(AwtsCssRule));
		if (!nr) return 0;
		sheet->rules = nr;
		sheet->ruleCap = next;
	}
	sheet->rules[sheet->ruleCount++] = *r;
	return 1;
}

int awts_css_parse(const char* css, AwtsCssSheet* out) {
	if (!css || !out) return 0;
	memset(out, 0, sizeof(*out));
	const char* p = css;
	while (*p) {
		/* Skip whitespace/comments. */
		while (isspace((unsigned char)*p)) p++;
		if (p[0] == '/' && p[1] == '*') {
			p += 2;
			while (*p && !(p[0] == '*' && p[1] == '/')) p++;
			if (*p) p += 2;
			continue;
		}
		if (!*p) break;
		/* Skip @-rules entirely. */
		if (*p == '@') {
			while (*p && *p != ';' && *p != '{') p++;
			if (*p == '{') {
				int depth = 1;
				p++;
				while (*p && depth) {
					if (*p == '{') depth++;
					else if (*p == '}') depth--;
					p++;
				}
			} else if (*p == ';') {
				p++;
			}
			continue;
		}
		/* Selector list up to '{'. */
		const char* ss = p;
		while (*p && *p != '{' && *p != '}') p++;
		if (*p != '{') {
			if (*p == '}') p++;
			continue;
		}
		size_t sl = (size_t)(p - ss);
		p++; /* '{' */
		const char* ds = p;
		int depth = 1;
		while (*p && depth) {
			if (*p == '{') depth++;
			else if (*p == '}') depth--;
			p++;
		}
		size_t dl = (size_t)(p - ds) - (depth == 0 ? 1 : 0);
		if (sl == 0 || dl == 0) continue;

		AwtsCssRule rule;
		memset(&rule, 0, sizeof(rule));
		/* Split selectors on ','. */
		const char* q = ss;
		while (q < ss + sl && rule.selCount < 8) {
			while (q < ss + sl && isspace((unsigned char)*q)) q++;
			const char* se = q;
			while (se < ss + sl && *se != ',') se++;
			size_t snl = (size_t)(se - q);
			while (snl > 0 && isspace((unsigned char)q[snl - 1]))
				snl--;
			if (snl > 0) {
				parse_selector(q, snl,
					&rule.sels[rule.selCount++]);
			}
			q = se < ss + sl ? se + 1 : se;
		}
		/* Declarations. */
		char dbuf[2048];
		size_t copy = dl < sizeof(dbuf) - 1 ? dl : sizeof(dbuf) - 1;
		memcpy(dbuf, ds, copy);
		dbuf[copy] = 0;
		rule.declCount = awts_css_parse_decls(dbuf, rule.decls, 24);
		if (rule.selCount > 0 && rule.declCount > 0)
			rule_add(out, &rule);
	}
	return 1;
}

void awts_css_free(AwtsCssSheet* sheet) {
	if (!sheet) return;
	free(sheet->rules);
	memset(sheet, 0, sizeof(*sheet));
}

void awts_css_computed_init(AwtsCssComputed* c) {
	if (!c) return;
	memset(c, 0, sizeof(*c));
	c->bold = 0;
	c->align = AWTS_CSS_ALIGN_LEFT;
}

static int sel_matches(const AwtsCssSimpleSel* sel, const char* tag,
	const char* cls, const char* id) {
	if (sel->tag[0] && (!tag || strcmp(sel->tag, tag) != 0))
		return 0;
	if (sel->isClass) {
		if (!cls || !sel->name[0]) return 0;
		/* class list: space-separated; match any. */
		const char* q = cls;
		int found = 0;
		while (*q) {
			while (*q == ' ') q++;
			const char* e = q;
			while (*e && *e != ' ') e++;
			if ((size_t)(e - q) == strlen(sel->name)
				&& strncmp(q, sel->name, (size_t)(e - q))
					== 0) {
				found = 1;
				break;
			}
			q = e;
		}
		if (!found) return 0;
	}
	if (sel->isId) {
		if (!id || strcmp(sel->name, id) != 0) return 0;
	}
	return 1;
}

static void apply_decl(AwtsCssComputed* c, const AwtsCssDecl* d) {
	switch (d->prop) {
	case AWTS_CSS_COLOR:
		memcpy(c->color, d->color, sizeof(c->color));
		c->hasColor = 1;
		break;
	case AWTS_CSS_BACKGROUND_COLOR:
		memcpy(c->bg, d->color, sizeof(c->bg));
		c->hasBg = 1;
		break;
	case AWTS_CSS_FONT_SIZE:
		c->fontPx = d->px;
		break;
	case AWTS_CSS_FONT_WEIGHT:
		c->bold = d->ival;
		break;
	case AWTS_CSS_TEXT_ALIGN:
		c->align = d->ival;
		break;
	case AWTS_CSS_MARGIN:
		memcpy(c->margin, d->box, sizeof(c->margin));
		break;
	case AWTS_CSS_PADDING:
		memcpy(c->padding, d->box, sizeof(c->padding));
		break;
	case AWTS_CSS_DISPLAY:
		c->displayNone = (d->ival == AWTS_CSS_DISPLAY_NONE);
		break;
	}
}

void awts_css_compute(const AwtsCssSheet* sheet, const char* tag,
	const char* cls, const char* id, const char* inlineStyle,
	AwtsCssComputed* out) {
	awts_css_computed_init(out);
	if (!sheet) return;
	/* Collect matching (specificity, order, decl) then apply. */
	typedef struct { int spec; int order; AwtsCssDecl decl; } Hit;
	Hit hits[256];
	int nh = 0;
	for (int i = 0; i < sheet->ruleCount && nh < 256; i++) {
		const AwtsCssRule* r = &sheet->rules[i];
		int best = -1;
		for (int s = 0; s < r->selCount; s++) {
			if (sel_matches(&r->sels[s].target, tag, cls,
				id)) {
				if (r->sels[s].specificity > best)
					best = r->sels[s].specificity;
			}
		}
		if (best < 0) continue;
		for (int d = 0; d < r->declCount && nh < 256; d++) {
			hits[nh].spec = best;
			hits[nh].order = i;
			hits[nh].decl = r->decls[d];
			nh++;
		}
	}
	/* Stable sort by (spec, order). Insertion sort is fine (nh<=256). */
	for (int i = 1; i < nh; i++) {
		Hit h = hits[i];
		int j = i - 1;
		while (j >= 0 && (hits[j].spec > h.spec
			|| (hits[j].spec == h.spec
				&& hits[j].order > h.order))) {
			hits[j + 1] = hits[j];
			j--;
		}
		hits[j + 1] = h;
	}
	for (int i = 0; i < nh; i++)
		apply_decl(out, &hits[i].decl);
	/* Inline style wins over everything. */
	if (inlineStyle && *inlineStyle) {
		AwtsCssDecl decls[24];
		int n = awts_css_parse_decls(inlineStyle, decls, 24);
		for (int i = 0; i < n; i++)
			apply_decl(out, &decls[i]);
	}
}

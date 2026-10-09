/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_html.h"

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <ctype.h>

typedef struct {
	const char* p;
	const char* end;
	AwtsHtmlDoc* doc;
	/* Current text run being accumulated. */
	char* buf;
	size_t bufLen;
	size_t bufCap;
	AwtsHtmlBlockKind runKind;
	int runLevel;
	char* runHref;      /* owned while a run is open */
	char* runCls;
	char* runId;
	char* runStyle;
	char runTag[16];
	int inTitle;
	int inStyle;
	int skipDepth;      /* >0 inside script/noscript */
	int inPre;
	/* Captured <style> text. */
	char* cssBuf;
	size_t cssLen;
	size_t cssCap;
} AwtsHtmlParser;

static void buf_reserve(AwtsHtmlParser* ps, size_t extra) {
	if (ps->bufLen + extra + 1 <= ps->bufCap) return;
	size_t next = ps->bufCap ? ps->bufCap * 2 : 256;
	while (next < ps->bufLen + extra + 1) next *= 2;
	char* nbuf = (char*)realloc(ps->buf, next);
	if (nbuf) { ps->buf = nbuf; ps->bufCap = next; }
}

static void buf_put_n(AwtsHtmlParser* ps, const char* s, size_t n) {
	if (!n) return;
	buf_reserve(ps, n);
	if (!ps->buf) return;
	memcpy(ps->buf + ps->bufLen, s, n);
	ps->bufLen += n;
	ps->buf[ps->bufLen] = 0;
}

/* Collapse runs of whitespace to a single space (unless in <pre>). */
static void buf_put_text(AwtsHtmlParser* ps, const char* s, size_t n) {
	if (ps->inPre) { buf_put_n(ps, s, n); return; }
	for (size_t i = 0; i < n; i++) {
		char c = s[i];
		if (c == ' ' || c == '\t' || c == '\r' || c == '\n' || c == '\f') {
			if (ps->bufLen > 0 && ps->buf[ps->bufLen - 1] != ' ')
				buf_put_n(ps, " ", 1);
		} else {
			buf_put_n(ps, &c, 1);
		}
	}
}

static int block_add(AwtsHtmlDoc* doc, AwtsHtmlBlockKind kind, int level,
	const char* tag, const char* text, const char* href, const char* cls,
	const char* id, const char* style) {
	if (doc->blockCount >= doc->blockCap) {
		size_t next = doc->blockCap ? doc->blockCap * 2 : 64;
		AwtsHtmlBlock* n = (AwtsHtmlBlock*)realloc(doc->blocks,
			next * sizeof(AwtsHtmlBlock));
		if (!n) return 0;
		doc->blocks = n;
		doc->blockCap = next;
	}
	AwtsHtmlBlock* b = &doc->blocks[doc->blockCount++];
	b->kind = kind;
	b->level = level;
	strncpy(b->tag, tag ? tag : "", sizeof(b->tag) - 1);
	b->tag[sizeof(b->tag) - 1] = 0;
	b->text = text ? strdup(text) : NULL;
	b->href = href ? strdup(href) : NULL;
	b->cls = cls ? strdup(cls) : NULL;
	b->id = id ? strdup(id) : NULL;
	b->style = style ? strdup(style) : NULL;
	return 1;
}

/* Flushes the current text run into a block (trims trailing space). */
static void flush_run(AwtsHtmlParser* ps) {
	while (ps->bufLen > 0 && ps->buf[ps->bufLen - 1] == ' ') {
		ps->buf[--ps->bufLen] = 0;
	}
	/* Trim leading space. */
	size_t start = 0;
	if (!ps->inPre && ps->buf) {
		while (start < ps->bufLen && ps->buf[start] == ' ') start++;
	}
	if (ps->bufLen > start) {
		if (ps->runKind == AWTS_HTML_LINK && !ps->runHref) {
			block_add(ps->doc, AWTS_HTML_TEXT, 0, ps->runTag,
				ps->buf + start, NULL,
				ps->runCls, ps->runId, ps->runStyle);
		} else {
			block_add(ps->doc, ps->runKind, ps->runLevel,
				ps->runTag, ps->buf + start, ps->runHref,
				ps->runCls, ps->runId, ps->runStyle);
		}
	}
	ps->bufLen = 0;
	if (ps->buf) ps->buf[0] = 0;
	ps->runKind = AWTS_HTML_TEXT;
	ps->runLevel = 0;
	ps->runTag[0] = 0;
	free(ps->runHref);
	ps->runHref = NULL;
	free(ps->runCls);
	ps->runCls = NULL;
	free(ps->runId);
	ps->runId = NULL;
	free(ps->runStyle);
	ps->runStyle = NULL;
}

static void start_run(AwtsHtmlParser* ps, AwtsHtmlBlockKind kind, int level,
	const char* tag, const char* href, const char* cls, const char* id,
	const char* style) {
	flush_run(ps);
	ps->runKind = kind;
	ps->runLevel = level;
	strncpy(ps->runTag, tag ? tag : "", sizeof(ps->runTag) - 1);
	ps->runTag[sizeof(ps->runTag) - 1] = 0;
	free(ps->runHref);
	ps->runHref = href ? strdup(href) : NULL;
	free(ps->runCls);
	ps->runCls = cls ? strdup(cls) : NULL;
	free(ps->runId);
	ps->runId = id ? strdup(id) : NULL;
	free(ps->runStyle);
	ps->runStyle = style ? strdup(style) : NULL;
}

/* Decodes one entity starting at `p` (which points at '&').
   Appends decoded text, returns pointer past the entity. */
static const char* decode_entity(AwtsHtmlParser* ps, const char* p,
	const char* end) {
	const char* semi = p + 1;
	while (semi < end && semi < p + 12 && *semi != ';'
		&& (isalnum((unsigned char)*semi) || *semi == '#')) {
		semi++;
	}
	int hasSemi = (semi < end && *semi == ';');
	size_t nameLen = (size_t)(semi - (p + 1));
	char out[8];
	size_t outLen = 0;

	if (nameLen == 3 && strncmp(p + 1, "amp", 3) == 0) {
		out[0] = '&'; outLen = 1;
	} else if (nameLen == 2 && strncmp(p + 1, "lt", 2) == 0) {
		out[0] = '<'; outLen = 1;
	} else if (nameLen == 2 && strncmp(p + 1, "gt", 2) == 0) {
		out[0] = '>'; outLen = 1;
	} else if (nameLen == 4 && strncmp(p + 1, "quot", 4) == 0) {
		out[0] = '"'; outLen = 1;
	} else if ((nameLen == 4 && strncmp(p + 1, "#39", 4) == 0)
		|| (nameLen == 5 && strncmp(p + 1, "#x27", 5) == 0)) {
		out[0] = '\''; outLen = 1;
	} else if (nameLen > 1 && p[1] == '#') {
		unsigned long cp = 0;
		if (p[2] == 'x' || p[2] == 'X') {
			for (size_t i = 3; i < 1 + nameLen; i++) {
				char c = p[i];
				cp <<= 4;
				if (c >= '0' && c <= '9') cp += (unsigned)(c - '0');
				else if (c >= 'a' && c <= 'f') cp += (unsigned)(c - 'a' + 10);
				else if (c >= 'A' && c <= 'F') cp += (unsigned)(c - 'A' + 10);
				else { cp = 0; break; }
			}
		} else {
			for (size_t i = 1; i < nameLen; i++) {
				char c = p[1 + i];
				if (c < '0' || c > '9') { cp = 0; break; }
				cp = cp * 10 + (unsigned)(c - '0');
			}
		}
		if (cp > 0 && cp < 0x110000) {
			if (cp < 0x80) { out[0] = (char)cp; outLen = 1; }
			else if (cp < 0x800) {
				out[0] = (char)(0xC0 | (cp >> 6));
				out[1] = (char)(0x80 | (cp & 0x3F)); outLen = 2;
			} else if (cp < 0x10000) {
				out[0] = (char)(0xE0 | (cp >> 12));
				out[1] = (char)(0x80 | ((cp >> 6) & 0x3F));
				out[2] = (char)(0x80 | (cp & 0x3F)); outLen = 3;
			} else {
				out[0] = (char)(0xF0 | (cp >> 18));
				out[1] = (char)(0x80 | ((cp >> 12) & 0x3F));
				out[2] = (char)(0x80 | ((cp >> 6) & 0x3F));
				out[3] = (char)(0x80 | (cp & 0x3F)); outLen = 4;
			}
		}
	} else if (nameLen == 4 && strncmp(p + 1, "nbsp", 4) == 0) {
		out[0] = (char)0xC2; out[1] = (char)0xA0; outLen = 2;
	}
	if (outLen) {
		buf_put_text(ps, out, outLen);
		return semi + (hasSemi ? 1 : 0);
	}
	/* Unknown entity: emit literally. */
	buf_put_text(ps, p, (size_t)(semi - p) + (hasSemi ? 1 : 0));
	return semi + (hasSemi ? 1 : 0);
}

static int tag_name_is(const char* p, const char* end, const char* name) {
	size_t n = strlen(name);
	if ((size_t)(end - p) < n) return 0;
	for (size_t i = 0; i < n; i++) {
		if (tolower((unsigned char)p[i]) != name[i]) return 0;
	}
	char c = p[n];
	return c == 0 || c == ' ' || c == '\t' || c == '\r' || c == '\n'
		|| c == '/' || c == '>';
}

/* Forward: defined below grab_attrs. */
static char* tag_attr(const char* p, const char* end, const char* name);

/* Appends raw text to the <style> capture buffer. */
static void css_put(AwtsHtmlParser* ps, const char* s, size_t n) {	if (!n) return;
	if (ps->cssLen + n + 2 > ps->cssCap) {
		size_t next = ps->cssCap ? ps->cssCap * 2 : 1024;
		while (next < ps->cssLen + n + 2) next *= 2;
		char* nb = (char*)realloc(ps->cssBuf, next);
		if (!nb) return;
		ps->cssBuf = nb;
		ps->cssCap = next;
	}
	memcpy(ps->cssBuf + ps->cssLen, s, n);
	ps->cssLen += n;
	ps->cssBuf[ps->cssLen] = 0;
}

/* Grabs class/id/style attributes from an open tag. */
static void grab_attrs(const char* tagStart, const char* tagEnd,
	char** cls, char** id, char** style) {
	*cls = tag_attr(tagStart, tagEnd, "class");
	*id = tag_attr(tagStart, tagEnd, "id");
	*style = tag_attr(tagStart, tagEnd, "style");
}

/* Extracts name="..." value; returns malloc'd string or NULL. */
static char* tag_attr(const char* p, const char* end, const char* name) {
	size_t nl = strlen(name);
	const char* q = p;
	while (q < end) {
		while (q < end && *q != '>' && isspace((unsigned char)*q)) q++;
		if (q + nl <= end) {
			size_t i;
			for (i = 0; i < nl; i++) {
				if (tolower((unsigned char)q[i]) != name[i]) break;
			}
			if (i == nl && (q + nl >= end || q[nl] == '='
				|| isspace((unsigned char)q[nl])
				|| q[nl] == '>')) {
				q += nl;
				while (q < end && isspace((unsigned char)*q)) q++;
				if (q < end && *q == '=') {
					q++;
					while (q < end && isspace((unsigned char)*q))
						q++;
					char quote = 0;
					if (q < end && (*q == '"' || *q == '\'')) {
						quote = *q++;
					}
					const char* vs = q;
					while (q < end && *q != '>'
						&& (quote ? *q != quote
						          : !isspace((unsigned char)*q))) {
						q++;
					}
					size_t vl = (size_t)(q - vs);
					char* v = (char*)malloc(vl + 1);
					if (v) {
						memcpy(v, vs, vl);
						v[vl] = 0;
					}
					return v;
				}
				return NULL;
			}
		}
		while (q < end && *q != '>' && !isspace((unsigned char)*q)) q++;
		if (q < end && *q == '>') break;
	}
	return NULL;
}

int awts_html_parse(const char* html, size_t len, AwtsHtmlDoc* out) {
	if (!html || !out) return 0;
	memset(out, 0, sizeof(*out));
	AwtsHtmlParser ps;
	memset(&ps, 0, sizeof(ps));
	ps.p = html;
	ps.end = html + len;
	ps.doc = out;
	ps.runKind = AWTS_HTML_TEXT;

	while (ps.p < ps.end) {
		const char* p = ps.p;
		if (*p == '<') {
			/* Comment? */
			if (p + 4 <= ps.end && strncmp(p, "<!--", 4) == 0) {
				const char* e = p + 4;
				while (e + 3 <= ps.end && strncmp(e, "-->", 3) != 0) e++;
				ps.p = (e + 3 <= ps.end) ? e + 3 : ps.end;
				continue;
			}
			/* Doctype / decl / CDATA-ish: skip to '>'. */
			if (p + 2 <= ps.end && (p[1] == '!' || p[1] == '?')) {
				const char* e = p + 2;
				while (e < ps.end && *e != '>') e++;
				ps.p = (e < ps.end) ? e + 1 : ps.end;
				continue;
			}
			const char* tagStart = p + 1;
			int closing = 0;
			if (tagStart < ps.end && *tagStart == '/') {
				closing = 1;
				tagStart++;
			}
			const char* tagEnd = tagStart;
			while (tagEnd < ps.end && *tagEnd != '>') tagEnd++;
			const char* after = (tagEnd < ps.end) ? tagEnd + 1 : ps.end;

			if (ps.skipDepth > 0) {
				if (closing && (tag_name_is(tagStart, tagEnd, "script")
					|| tag_name_is(tagStart, tagEnd, "noscript"))) {
					ps.skipDepth--;
				}
				ps.p = after;
				continue;
			}
			if (!closing && (tag_name_is(tagStart, tagEnd, "script")
				|| tag_name_is(tagStart, tagEnd, "noscript"))) {
				ps.skipDepth++;
				ps.p = after;
				continue;
			}
			/* <style>: capture raw text for the CSS engine. */
			if (!closing && tag_name_is(tagStart, tagEnd, "style")) {
				flush_run(&ps);
				ps.inStyle = 1;
				ps.p = after;
				continue;
			}
			if (closing && tag_name_is(tagStart, tagEnd, "style")) {
				ps.inStyle = 0;
				css_put(&ps, "\n", 1);
				ps.p = after;
				continue;
			}
			if (!closing && tag_name_is(tagStart, tagEnd, "title")) {
				ps.inTitle = 1;
				free(out->title);
				out->title = NULL;
				ps.p = after;
				continue;
			}
			if (closing && tag_name_is(tagStart, tagEnd, "title")) {
				ps.inTitle = 0;
				ps.p = after;
				continue;
			}
			/* Block structure. */
			if (!closing && tag_name_is(tagStart, tagEnd, "br")) {
				flush_run(&ps);
			} else if (!closing && tag_name_is(tagStart, tagEnd, "hr")) {
				flush_run(&ps);
				block_add(out, AWTS_HTML_HR, 0, "hr", NULL, NULL,
					NULL, NULL, NULL);
			} else if (!closing && tag_name_is(tagStart, tagEnd, "p")) {
				char *c = NULL, *i = NULL, *s = NULL;
				grab_attrs(tagStart, tagEnd, &c, &i, &s);
				start_run(&ps, AWTS_HTML_TEXT, 0, "p", NULL, c, i, s);
				free(c); free(i); free(s);
			} else if (!closing && (tag_name_is(tagStart, tagEnd, "div")
				|| tag_name_is(tagStart, tagEnd, "section")
				|| tag_name_is(tagStart, tagEnd, "article")
				|| tag_name_is(tagStart, tagEnd, "main")
				|| tag_name_is(tagStart, tagEnd, "header")
				|| tag_name_is(tagStart, tagEnd, "footer")
				|| tag_name_is(tagStart, tagEnd, "nav")
				|| tag_name_is(tagStart, tagEnd, "ul")
				|| tag_name_is(tagStart, tagEnd, "ol")
				|| tag_name_is(tagStart, tagEnd, "tr")
				|| tag_name_is(tagStart, tagEnd, "table"))) {
				char *c = NULL, *i = NULL, *s = NULL;
				grab_attrs(tagStart, tagEnd, &c, &i, &s);
				start_run(&ps, AWTS_HTML_TEXT, 0, "div", NULL, c, i, s);
				free(c); free(i); free(s);
			} else if (!closing && tag_name_is(tagStart, tagEnd, "li")) {
				char *c = NULL, *i = NULL, *s = NULL;
				grab_attrs(tagStart, tagEnd, &c, &i, &s);
				start_run(&ps, AWTS_HTML_ITEM, 0, "li", NULL, c, i, s);
				free(c); free(i); free(s);
			} else if (!closing && tag_name_is(tagStart, tagEnd, "pre")) {
				flush_run(&ps);
				ps.inPre = 1;
				ps.runKind = AWTS_HTML_PRE;
			} else if (closing && tag_name_is(tagStart, tagEnd, "pre")) {
				flush_run(&ps);
				ps.inPre = 0;
			} else if (!closing && tag_name_is(tagStart, tagEnd, "a")) {
				char* href = tag_attr(tagStart, tagEnd, "href");
				char *c = NULL, *i = NULL, *s = NULL;
				grab_attrs(tagStart, tagEnd, &c, &i, &s);
				start_run(&ps, AWTS_HTML_LINK, 0, "a", href, c, i, s);
				free(href); free(c); free(i); free(s);
			} else if (closing && tag_name_is(tagStart, tagEnd, "a")) {
				flush_run(&ps);
			} else if (!closing && tagStart < tagEnd
				&& tolower((unsigned char)tagStart[0]) == 'h'
				&& tagStart + 1 < tagEnd
				&& tagStart[1] >= '1' && tagStart[1] <= '6'
				&& (tagStart + 2 >= tagEnd
					|| tagStart[2] == ' ' || tagStart[2] == '>'
					|| tagStart[2] == '/')) {
				char *c = NULL, *i = NULL, *s = NULL;
				grab_attrs(tagStart, tagEnd, &c, &i, &s);
				{ char ht[4]; ht[0]='h'; ht[1]=tagStart[1]; ht[2]=0;
				start_run(&ps, AWTS_HTML_HEADING,
					tagStart[1] - '0', ht, NULL, c, i, s); }
				free(c); free(i); free(s);
			} else if (closing && (tag_name_is(tagStart, tagEnd, "p")
				|| tag_name_is(tagStart, tagEnd, "div")
				|| tag_name_is(tagStart, tagEnd, "li"))) {
				flush_run(&ps);
			}
			ps.p = after;
			continue;
		}
		/* Text. */
		if (ps.skipDepth > 0) { ps.p++; continue; }
		if (ps.inStyle) {
			const char* e = p;
			while (e < ps.end && *e != '<') e++;
			css_put(&ps, p, (size_t)(e - p));
			ps.p = e;
			continue;
		}
		if (ps.inTitle) {
			const char* e = p;
			while (e < ps.end && *e != '<') e++;
			size_t tl = (size_t)(e - p);
			size_t old = out->title ? strlen(out->title) : 0;
			char* nt = (char*)realloc(out->title, old + tl + 1);
			if (nt) {
				memcpy(nt + old, p, tl);
				nt[old + tl] = 0;
				out->title = nt;
			}
			ps.p = e;
			continue;
		}
		if (*p == '&') {
			ps.p = decode_entity(&ps, p, ps.end);
			continue;
		}
		const char* e = p;
		while (e < ps.end && *e != '<' && *e != '&') e++;
		buf_put_text(&ps, p, (size_t)(e - p));
		ps.p = e;
	}
	flush_run(&ps);
	free(ps.buf);
	if (ps.cssLen) {
		out->css = ps.cssBuf;
	} else {
		free(ps.cssBuf);
	}
	return 1;
}

void awts_html_free(AwtsHtmlDoc* doc) {
	if (!doc) return;
	free(doc->title);
	free(doc->css);
	for (size_t i = 0; i < doc->blockCount; i++) {
		free(doc->blocks[i].text);
		free(doc->blocks[i].href);
		free(doc->blocks[i].cls);
		free(doc->blocks[i].id);
		free(doc->blocks[i].style);
	}
	free(doc->blocks);
	memset(doc, 0, sizeof(*doc));
}

int awts_url_is_http(const char* url) {
	return url && (strncmp(url, "http://", 7) == 0
		|| strncmp(url, "https://", 8) == 0);
}

/* Splits an absolute URL into scheme+host (with ://) and path parts. */
static void split_base(const char* base, char* schemeHost, size_t shCap,
	char* path, size_t pathCap) {
	schemeHost[0] = 0;
	path[0] = '/';
	path[1] = 0;
	const char* se = strstr(base, "://");
	if (!se) return;
	const char* hostStart = se + 3;
	const char* pe = strchr(hostStart, '/');
	size_t shLen = pe ? (size_t)(pe - base) : strlen(base);
	if (shLen >= shCap) shLen = shCap - 1;
	memcpy(schemeHost, base, shLen);
	schemeHost[shLen] = 0;
	if (pe) {
		size_t pl = strlen(pe);
		if (pl >= pathCap) pl = pathCap - 1;
		memcpy(path, pe, pl);
		path[pl] = 0;
		/* Strip query/fragment from base path. */
		char* q = strpbrk(path, "?#");
		if (q) *q = 0;
	}
}

void awts_url_resolve(const char* base, const char* ref,
	char* out, size_t cap) {
	if (!ref || !out || cap == 0) return;
	out[0] = 0;
	if (awts_url_is_http(ref)
		|| strncmp(ref, "data:", 5) == 0
		|| strncmp(ref, "about:", 6) == 0) {
		strncpy(out, ref, cap - 1);
		out[cap - 1] = 0;
		return;
	}
	char sh[512], bp[1024];
	split_base(base ? base : "", sh, sizeof(sh), bp, sizeof(bp));
	if (!sh[0]) {
		strncpy(out, ref, cap - 1);
		out[cap - 1] = 0;
		return;
	}
	if (ref[0] == '/' && ref[1] == '/') {
		/* Protocol-relative. */
		const char* se = strstr(sh, "://");
		size_t pl = se ? (size_t)(se - sh) : 0;
		snprintf(out, cap, "%.*s:%s", (int)pl, sh, ref);
		return;
	}
	if (ref[0] == '/') {
		snprintf(out, cap, "%s%s", sh, ref);
		return;
	}
	if (ref[0] == '#' || ref[0] == '?') {
		snprintf(out, cap, "%s%s%s", sh, bp, ref);
		return;
	}
	/* Relative: merge with base directory. */
	char dir[1024];
	strncpy(dir, bp, sizeof(dir) - 1);
	dir[sizeof(dir) - 1] = 0;
	char* slash = strrchr(dir, '/');
	if (slash) slash[1] = 0;
	else { dir[0] = '/'; dir[1] = 0; }
	/* Process ./ and ../ segments simply. */
	char merged[2048];
	snprintf(merged, sizeof(merged), "%s%s", dir, ref);
	/* Normalize /./ and /../ (single pass, no leading .. support needed). */
	char norm[2048];
	size_t ni = 0;
	const char* m = merged;
	while (*m && ni + 1 < sizeof(norm)) {
		if (strncmp(m, "/./", 3) == 0) { m += 2; continue; }
		if (strncmp(m, "/../", 4) == 0) {
			m += 3; /* keep the '/' — it becomes the separator */
			/* Drop the last segment including its leading slash. */
			while (ni > 0 && norm[ni - 1] != '/') ni--;
			if (ni > 0) ni--;
			continue;
		}
		norm[ni++] = *m++;
	}
	norm[ni] = 0;
	snprintf(out, cap, "%s%s", sh, norm);
}

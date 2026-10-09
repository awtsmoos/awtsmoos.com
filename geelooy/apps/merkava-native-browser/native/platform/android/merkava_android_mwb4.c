/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_mwb4.h"

#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/* MWB4 opcodes (NativeWebV4Format.js). */
#define MWB4_OP_END 0
#define MWB4_OP_CREATE_NODE 1
#define MWB4_OP_SET_ATTR 2
#define MWB4_OP_SET_STYLE 3
#define MWB4_OP_BIND_TEXT_EVENT 4
#define MWB4_OP_SET_STYLE_HANDLE 5

typedef struct Mwb4Reader {
	const uint8_t* bytes;
	size_t length;
	size_t at;
	int failed;
} Mwb4Reader;

static uint32_t read_u8(Mwb4Reader* r) {
	if (!r || r->at >= r->length) { if (r) r->failed = 1; return 0; }
	return r->bytes[r->at++];
}

static uint32_t read_varuint(Mwb4Reader* r) {
	uint32_t value = 0;
	unsigned shift = 0;
	while (shift < 35) {
		uint32_t byte = read_u8(r);
		if (r->failed) return 0;
		value |= (byte & 0x7Fu) << shift;
		if (!(byte & 0x80u)) break;
		shift += 7;
	}
	return value;
}

/* Reads a varuint-length UTF-8 string; returns malloc'd NUL-terminated copy. */
static char* read_string(Mwb4Reader* r) {
	uint32_t len = read_varuint(r);
	if (r->failed) return NULL;
	if (r->at + len > r->length) { r->failed = 1; return NULL; }
	char* out = (char*)malloc(len + 1);
	if (!out) { r->failed = 1; return NULL; }
	memcpy(out, r->bytes + r->at, len);
	out[len] = 0;
	r->at += len;
	return out;
}

static char* dup_str(const char* s) {
	size_t n = s ? strlen(s) : 0;
	char* out = (char*)malloc(n + 1);
	if (!out) return NULL;
	memcpy(out, s ? s : "", n + 1);
	return out;
}

/* Minimal JSON string extractor: finds "key":"value" in the manifest. */
static char* manifest_string(const uint8_t* bytes, size_t len, const char* key) {
	if (!bytes || !len || !key) return NULL;
	size_t keyLen = strlen(key);
	/* pattern: "key":"  ->  1 + keyLen + 3 bytes */
	size_t patLen = keyLen + 4;
	char* pat = (char*)malloc(patLen + 1);
	if (!pat) return NULL;
	pat[0] = '"';
	memcpy(pat + 1, key, keyLen);
	memcpy(pat + 1 + keyLen, "\":\"", 3);
	pat[patLen] = 0;
	char* found = NULL;
	for (size_t i = 0; i + patLen < len; i++) {
		if (memcmp(bytes + i, pat, patLen) == 0) {
			size_t v = i + patLen;
			size_t e = v;
			while (e < len && bytes[e] != '"') {
				if (bytes[e] == '\\' && e + 1 < len) e++;
				e++;
			}
			size_t vlen = e - v;
			found = (char*)malloc(vlen + 1);
			if (found) { memcpy(found, bytes + v, vlen); found[vlen] = 0; }
			break;
		}
	}
	free(pat);
	return found;
}

static int parse_hex_color(const char* s, float* r, float* g, float* b) {
	unsigned int rv, gv, bv;
	if (!s || s[0] != '#' || strlen(s) < 7) return 0;
	if (sscanf(s + 1, "%2x%2x%2x", &rv, &gv, &bv) != 3) return 0;
	*r = rv / 255.0f; *g = gv / 255.0f; *b = bv / 255.0f;
	return 1;
}

/* Per-handle color resolved from SET_STYLE / SET_STYLE_HANDLE ops. */
typedef struct HandleColor {
	uint32_t handle;
	float r, g, b;
} HandleColor;

/* id attribute -> DOM handle, for "#id" selector styles. */
typedef struct IdHandle {
	char* id;
	uint32_t handle;
} IdHandle;

static void note_color(HandleColor** colors, size_t* n, size_t* cap,
		uint32_t handle, const char* prop, const char* value) {
	if (!prop || !value || strcmp(prop, "color") != 0) return;
	float r, g, b;
	if (!parse_hex_color(value, &r, &g, &b)) return;
	for (size_t i = 0; i < *n; i++) {
		if ((*colors)[i].handle == handle) {
			(*colors)[i].r = r; (*colors)[i].g = g; (*colors)[i].b = b;
			return;
		}
	}
	if (*n == *cap) {
		size_t ncap = *cap ? *cap * 2 : 16;
		HandleColor* grown = (HandleColor*)realloc(*colors, ncap * sizeof(HandleColor));
		if (!grown) return;
		*colors = grown; *cap = ncap;
	}
	(*colors)[*n].handle = handle;
	(*colors)[*n].r = r; (*colors)[*n].g = g; (*colors)[*n].b = b;
	(*n)++;
}

static void lookup_color(HandleColor* colors, size_t n, uint32_t handle,
		float* r, float* g, float* b) {
	for (size_t i = 0; i < n; i++) {
		if (colors[i].handle == handle) {
			*r = colors[i].r; *g = colors[i].g; *b = colors[i].b;
			return;
		}
	}
}

static int is_heading_tag(const char* tag) {
	return tag && (strcmp(tag, "h1") == 0 || strcmp(tag, "h2") == 0 ||
		strcmp(tag, "h3") == 0 || strcmp(tag, "h4") == 0 ||
		strcmp(tag, "h5") == 0 || strcmp(tag, "h6") == 0);
}

static void push_text(AwtsMwb4Doc* doc, const char* text, uint32_t handle,
		const char* tag) {
	if (!text || !*text) return;
	AwtsMwb4Text* grown = (AwtsMwb4Text*)realloc(
		doc->texts, (doc->textCount + 1) * sizeof(AwtsMwb4Text));
	if (!grown) return;
	doc->texts = grown;
	AwtsMwb4Text* t = &doc->texts[doc->textCount++];
	memset(t, 0, sizeof(*t));
	t->text = dup_str(text);
	t->handle = handle;
	t->r = 0.96f; t->g = 0.96f; t->b = 0.98f;
	t->isHeading = is_heading_tag(tag);
}

/* Decodes one pass: collects text runs and per-handle colors. */
int awts_mwb4_decode(
		const uint8_t* mwb4, size_t mwb4Len,
		const uint8_t* manifestBytes, size_t manifestLen,
		AwtsMwb4Doc* out) {
	if (!out) return 0;
	memset(out, 0, sizeof(*out));
	if (!mwb4 || mwb4Len < 6) return 0;
	if (memcmp(mwb4, "MWB4", 4) != 0) return 0;

	Mwb4Reader r = { mwb4, mwb4Len, 0, 0 };
	r.at = 4;
	(void)read_u8(&r); /* version */
	uint32_t poolCount = read_varuint(&r);
	if (r.failed || poolCount > 100000) return 0;

	char** pool = (char**)calloc(poolCount ? poolCount : 1, sizeof(char*));
	if (!pool) return 0;
	for (uint32_t i = 0; i < poolCount; i++) {
		pool[i] = read_string(&r);
		if (r.failed) { pool[i] = dup_str(""); r.failed = 0; }
	}
	uint32_t codeLen = read_varuint(&r);
	if (r.failed || r.at + codeLen > r.length) {
		for (uint32_t i = 0; i < poolCount; i++) free(pool[i]);
		free(pool);
		return 0;
	}
	size_t codeEnd = r.at + codeLen;

	HandleColor* colors = NULL;
	size_t colorCount = 0, colorCap = 0;
	IdHandle* ids = NULL;
	size_t idCount = 0, idCap = 0;

	while (r.at < codeEnd && !r.failed) {
		uint32_t op = read_u8(&r);
		if (r.failed) break;
		if (op == MWB4_OP_END) break;
		if (op == MWB4_OP_CREATE_NODE) {
			uint32_t handle = read_varuint(&r);
			(void)read_varuint(&r); /* parentHandle */
			uint32_t tagIdx = read_varuint(&r);
			uint32_t idIdx = read_varuint(&r);
			uint32_t textIdx = read_varuint(&r);
			const char* tag = tagIdx < poolCount ? pool[tagIdx] : "";
			const char* id = idIdx < poolCount ? pool[idIdx] : "";
			const char* text = textIdx < poolCount ? pool[textIdx] : "";
			out->nodeCount++;
			push_text(out, text, handle, tag);
			if (id && *id) {
				if (idCount == idCap) {
					size_t ncap = idCap ? idCap * 2 : 16;
					IdHandle* grown = (IdHandle*)realloc(ids, ncap * sizeof(IdHandle));
					if (grown) { ids = grown; idCap = ncap; }
				}
				if (idCount < idCap) {
					ids[idCount].id = dup_str(id);
					ids[idCount].handle = handle;
					idCount++;
				}
			}
			/* attributes follow as SET_ATTR ops; handled in main loop */
		} else if (op == MWB4_OP_SET_ATTR) {
			(void)read_varuint(&r);
			(void)read_varuint(&r);
			(void)read_varuint(&r);
		} else if (op == MWB4_OP_SET_STYLE) {
			uint32_t selIdx = read_varuint(&r);
			uint32_t propIdx = read_varuint(&r);
			uint32_t valIdx = read_varuint(&r);
			const char* sel = selIdx < poolCount ? pool[selIdx] : "";
			const char* prop = propIdx < poolCount ? pool[propIdx] : "";
			const char* val = valIdx < poolCount ? pool[valIdx] : "";
			out->styleCount++;
			if (sel && sel[0] == '#') {
				for (size_t i = 0; i < idCount; i++) {
					if (ids[i].id && strcmp(ids[i].id, sel + 1) == 0) {
						note_color(&colors, &colorCount, &colorCap,
							ids[i].handle, prop, val);
						break;
					}
				}
			}
		} else if (op == MWB4_OP_SET_STYLE_HANDLE) {
			uint32_t handle = read_varuint(&r);
			uint32_t propIdx = read_varuint(&r);
			uint32_t valIdx = read_varuint(&r);
			const char* prop = propIdx < poolCount ? pool[propIdx] : "";
			const char* val = valIdx < poolCount ? pool[valIdx] : "";
			out->styleCount++;
			note_color(&colors, &colorCount, &colorCap, handle, prop, val);
		} else if (op == MWB4_OP_BIND_TEXT_EVENT) {
			(void)read_varuint(&r);
			(void)read_varuint(&r);
			(void)read_varuint(&r);
			(void)read_varuint(&r);
		} else {
			break; /* unknown opcode: stop, keep what we decoded */
		}
	}

	/* Second pass for selector styles would need id->handle mapping; the
	   handle-targeted colors above are already applied via lookup. */
	out->appName = manifest_string(manifestBytes, manifestLen, "name");

	/* Styles are encoded after nodes: apply per-handle colors now. */
	for (size_t i = 0; i < out->textCount; i++) {
		lookup_color(colors, colorCount, out->texts[i].handle,
			&out->texts[i].r, &out->texts[i].g, &out->texts[i].b);
	}
	out->ok = 1;

	for (uint32_t i = 0; i < poolCount; i++) free(pool[i]);
	free(pool);
	free(colors);
	for (size_t i = 0; i < idCount; i++) free(ids[i].id);
	free(ids);
	return 1;
}

void awts_mwb4_free(AwtsMwb4Doc* doc) {
	if (!doc) return;
	for (size_t i = 0; i < doc->textCount; i++) free(doc->texts[i].text);
	free(doc->texts);
	free(doc->appName);
	memset(doc, 0, sizeof(*doc));
}

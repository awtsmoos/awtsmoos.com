/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_ttf.h"

#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/* ---------- big-endian readers ---------- */

static uint16_t rd16(const uint8_t* p) {
	return (uint16_t)((p[0] << 8) | p[1]);
}
static int16_t rds16(const uint8_t* p) {
	return (int16_t)rd16(p);
}
static uint32_t rd32(const uint8_t* p) {
	return ((uint32_t)p[0] << 24) | ((uint32_t)p[1] << 16) |
	       ((uint32_t)p[2] << 8) | (uint32_t)p[3];
}

static int in_range(const AwtsTtfFace* f, const uint8_t* p, size_t n) {
	return p >= f->data && p + n <= f->data + f->len;
}

/* ---------- table directory ---------- */

static const uint8_t* find_table(const AwtsTtfFace* f, uint32_t tag) {
	if (f->len < 12) return NULL;
	uint16_t n = rd16(f->data + 4);
	const uint8_t* dir = f->data + 12;
	for (uint16_t i = 0; i < n; i++) {
		const uint8_t* e = dir + i * 16;
		if (!in_range(f, e, 16)) return NULL;
		if (rd32(e) == tag) {
			uint32_t off = rd32(e + 8), len = rd32(e + 12);
			if ((size_t)off + len > f->len) return NULL;
			return f->data + off;
		}
	}
	return NULL;
}

#define TAG(a,b,c,d) (((uint32_t)(a)<<24)|((uint32_t)(b)<<16)|((uint32_t)(c)<<8)|(uint32_t)(d))

int awts_ttf_parse(const uint8_t* data, size_t len, AwtsTtfFace* out) {
	memset(out, 0, sizeof(*out));
	if (!data || len < 12) return 0;
	out->data = data;
	out->len = len;

	uint32_t sfnt = rd32(data);
	if (sfnt != 0x00010000u && sfnt != TAG('t','r','u','e')) return 0;

	out->head = find_table(out, TAG('h','e','a','d'));
	out->maxp = find_table(out, TAG('m','a','x','p'));
	out->hhea = find_table(out, TAG('h','h','e','a'));
	out->hmtx = find_table(out, TAG('h','m','t','x'));
	out->cmap = find_table(out, TAG('c','m','a','p'));
	out->loca = find_table(out, TAG('l','o','c','a'));
	out->glyf = find_table(out, TAG('g','l','y','f'));
	if (!out->head || !out->maxp || !out->hhea || !out->hmtx ||
	    !out->cmap || !out->loca || !out->glyf) return 0;

	out->unitsPerEm = rd16(out->head + 18);
	out->locaLong = rd16(out->head + 50) != 0;
	out->numGlyphs = rd16(out->maxp + 4);
	out->numHMetrics = rd16(out->hhea + 34);
	if (out->unitsPerEm == 0 || out->numGlyphs == 0) return 0;

	out->ok = 1;
	return 1;
}

void awts_ttf_free(AwtsTtfFace* face) {
	if (face) memset(face, 0, sizeof(*face));
}

uint8_t* awts_ttf_read_file(const char* path, size_t* outLen) {
	FILE* fp = fopen(path, "rb");
	if (!fp) return NULL;
	fseek(fp, 0, SEEK_END);
	long n = ftell(fp);
	fseek(fp, 0, SEEK_SET);
	if (n <= 0 || n > (1 << 26)) { fclose(fp); return NULL; }
	uint8_t* buf = (uint8_t*)malloc((size_t)n);
	if (!buf) { fclose(fp); return NULL; }
	if (fread(buf, 1, (size_t)n, fp) != (size_t)n) {
		free(buf); fclose(fp); return NULL;
	}
	fclose(fp);
	if (outLen) *outLen = (size_t)n;
	return buf;
}

/* ---------- cmap: codepoint -> glyph ---------- */

static uint16_t cmap_format4(const uint8_t* cmap, uint32_t cp) {
	if (cp > 0xFFFFu) return 0;
	uint16_t segCount = rd16(cmap + 6) / 2;
	const uint8_t* endCode = cmap + 14;
	const uint8_t* startCode = endCode + 2 + segCount * 2;
	const uint8_t* idDelta = startCode + segCount * 2;
	const uint8_t* idRange = idDelta + segCount * 2;
	uint16_t code = (uint16_t)cp;
	for (uint16_t i = 0; i < segCount; i++) {
		uint16_t end = rd16(endCode + i * 2);
		if (code > end) continue;
		uint16_t start = rd16(startCode + i * 2);
		if (code < start) return 0;
		uint16_t rangeOff = rd16(idRange + i * 2);
		if (rangeOff == 0) {
			return (uint16_t)((code + rd16(idDelta + i * 2)) & 0xFFFFu);
		}
		const uint8_t* slot = idRange + i * 2 + rangeOff + (code - start) * 2;
		uint16_t g = rd16(slot);
		if (g == 0) return 0;
		return (uint16_t)((g + rd16(idDelta + i * 2)) & 0xFFFFu);
	}
	return 0;
}

static uint16_t cmap_format12(const uint8_t* cmap, uint32_t cp) {
	uint32_t nGroups = rd32(cmap + 12);
	const uint8_t* g = cmap + 16;
	for (uint32_t i = 0; i < nGroups; i++, g += 12) {
		uint32_t start = rd32(g), end = rd32(g + 4), glyph = rd32(g + 8);
		if (cp >= start && cp <= end) return (uint16_t)(glyph + (cp - start));
	}
	return 0;
}

uint16_t awts_ttf_glyph_index(const AwtsTtfFace* face, uint32_t codepoint) {
	if (!face || !face->ok) return 0;
	const uint8_t* cmap = face->cmap;
	if (!in_range(face, cmap, 4)) return 0;
	uint16_t n = rd16(cmap + 2);

	/* Prefer Windows Unicode BMP (3,1) then (3,10), then any Unicode. */
	const uint8_t* best = NULL;
	int bestScore = -1;
	for (uint16_t i = 0; i < n; i++) {
		const uint8_t* e = cmap + 4 + i * 8;
		if (!in_range(face, e, 8)) return 0;
		uint16_t plat = rd16(e), enc = rd16(e + 2);
		uint32_t off = rd32(e + 4);
		if (off + 4 > face->len - (size_t)(cmap - face->data)) continue;
		int score = -1;
		if (plat == 3 && enc == 10) score = 4;
		else if (plat == 3 && enc == 1) score = 3;
		else if (plat == 0) score = 2;
		if (score > bestScore) { bestScore = score; best = cmap + off; }
	}
	if (!best) return 0;
	uint16_t fmt = rd16(best);
	if (fmt == 4) return cmap_format4(best, codepoint);
	if (fmt == 12) return cmap_format12(best, codepoint);
	return 0;
}

int awts_ttf_advance(const AwtsTtfFace* face, uint16_t glyph) {
	if (!face || !face->ok || glyph >= face->numGlyphs) return 0;
	uint16_t m = glyph < face->numHMetrics ? glyph : face->numHMetrics - 1;
	const uint8_t* p = face->hmtx + m * 4;
	if (!in_range(face, p, 4)) return 0;
	return rd16(p);
}

/* ---------- glyf outline extraction ---------- */

typedef struct { float x, y; } Pt;

typedef struct {
	Pt* pts;          /* flattened polyline points */
	uint8_t* onCurve; /* 1 when the point is a real on-curve point */
	uint16_t* contourEnds; /* index of last point per contour */
	size_t nPts, capPts;
	size_t nContours, capContours;
} Outline;

static void outline_free(Outline* o) {
	free(o->pts); free(o->onCurve); free(o->contourEnds);
	memset(o, 0, sizeof(*o));
}

static int outline_reserve(Outline* o, size_t extra) {
	if (o->nPts + extra <= o->capPts) return 1;
	size_t cap = o->capPts ? o->capPts * 2 : 256;
	while (cap < o->nPts + extra) cap *= 2;
	Pt* np = (Pt*)realloc(o->pts, cap * sizeof(Pt));
	uint8_t* no = (uint8_t*)realloc(o->onCurve, cap);
	if (!np || !no) return 0;
	o->pts = np; o->onCurve = no; o->capPts = cap;
	return 1;
}

static int outline_add_contour(Outline* o) {
	if (o->nContours + 1 > o->capContours) {
		size_t cap = o->capContours ? o->capContours * 2 : 8;
		uint16_t* nc = (uint16_t*)realloc(o->contourEnds, cap * sizeof(uint16_t));
		if (!nc) return 0;
		o->contourEnds = nc; o->capContours = cap;
	}
	o->contourEnds[o->nContours++] = 0; /* filled in by caller */
	return 1;
}

static int outline_push(Outline* o, float x, float y, int onCurve) {
	if (!outline_reserve(o, 1)) return 0;
	o->pts[o->nPts].x = x;
	o->pts[o->nPts].y = y;
	o->onCurve[o->nPts] = (uint8_t)(onCurve ? 1 : 0);
	o->nPts++;
	return 1;
}

/* Subdivide a quadratic Bezier until flat; appends line segments. */
static int flatten_quad(Outline* o, float x0, float y0,
		float cx, float cy, float x1, float y1, int depth) {
	float dx = x1 - x0, dy = y1 - y0;
	float d = (cx - x0) * dy - (cy - y0) * dx;
	float len2 = dx * dx + dy * dy;
	/* Flat when control deviation < ~0.25px in font units (scaled later). */
	if (depth >= 8 || (len2 > 0 && (d * d) / len2 < 0.0625f)) {
		return outline_push(o, x1, y1, 0);
	}
	float mx01 = (x0 + cx) * 0.5f, my01 = (y0 + cy) * 0.5f;
	float mx12 = (cx + x1) * 0.5f, my12 = (cy + y1) * 0.5f;
	float mx = (mx01 + mx12) * 0.5f, my = (my01 + my12) * 0.5f;
	if (!flatten_quad(o, x0, y0, mx01, my01, mx, my, depth + 1)) return 0;
	return flatten_quad(o, mx, my, mx12, my12, x1, y1, depth + 1);
}

static uint32_t glyph_offset(const AwtsTtfFace* f, uint16_t glyph) {
	if (glyph >= f->numGlyphs) return 0;
	const uint8_t* loca = f->loca;
	uint32_t off;
	if (f->locaLong) {
		if (!in_range(f, loca + (size_t)glyph * 4, 8)) return 0;
		off = rd32(loca + (size_t)glyph * 4);
		uint32_t off2 = rd32(loca + (size_t)(glyph + 1) * 4);
		if (off == off2) return 0; /* empty */
	} else {
		if (!in_range(f, loca + (size_t)glyph * 2, 4)) return 0;
		off = (uint32_t)rd16(loca + (size_t)glyph * 2) * 2;
		uint32_t off2 = (uint32_t)rd16(loca + (size_t)(glyph + 1) * 2) * 2;
		if (off == off2) return 0; /* empty */
	}
	return off;
}

/* Decodes one glyph's outline into o, applying a 2D transform
 * (for composite components). Coordinates stay in font units. */
/* Decodes one glyph's outline into o, applying a 2D transform
 * (for composite components). Coordinates stay in font units. */
static int decode_simple(const uint8_t* g, Outline* o,
		float m00, float m01, float m10, float m11, float dx, float dy) {
	int16_t nContours = rds16(g);
	if (nContours <= 0) return 0; /* malformed simple glyph */
	const uint8_t* p = g + 10;
	/* B"H: ONE arena for all decode temporaries (was 4 + 3 per contour).
	   Peek nPts from the last contour end first. */
	uint16_t nPts = (uint16_t)(rd16(p + (size_t)(nContours - 1) * 2) + 1);
	size_t wsCap = (size_t)nPts * 2 + 2; /* max per-contour expansion */
	size_t arenaSize = (size_t)nContours * sizeof(uint16_t) + 16
		+ nPts + 16
		+ (size_t)nPts * sizeof(float) + 16
		+ (size_t)nPts * sizeof(float) + 16
		+ wsCap * sizeof(float) + 16
		+ wsCap * sizeof(float) + 16
		+ wsCap + 16;
	uint8_t* arena = (uint8_t*)malloc(arenaSize);
	if (!arena) return 0;
	uint8_t* ap = arena;
	uint16_t* ends = (uint16_t*)ap; ap += (size_t)nContours * sizeof(uint16_t);
	for (int i = 0; i < nContours; i++) ends[i] = rd16(p + i * 2);
	p += (size_t)nContours * 2;
	uint16_t instrLen = rd16(p); p += 2 + instrLen;

	uint8_t* flags = ap; ap += nPts;
	ap = (uint8_t*)(((uintptr_t)ap + 3) & ~(uintptr_t)3);
	float* xs = (float*)ap; ap += (size_t)nPts * sizeof(float);
	float* ys = (float*)ap; ap += (size_t)nPts * sizeof(float);
	float* ex = (float*)ap; ap += wsCap * sizeof(float);
	float* ey = (float*)ap; ap += wsCap * sizeof(float);
	uint8_t* eon = ap; /* tail workspace; nothing allocated after */
	size_t fi = 0;
	while (fi < nPts) {
		uint8_t fl = *p++;
		flags[fi++] = fl;
		if (fl & 8) {
			uint8_t rep = *p++;
			while (rep-- && fi < nPts) flags[fi++] = fl;
		}
	}
	float x = 0, y = 0;
	for (uint16_t i = 0; i < nPts; i++) {
		uint8_t fl = flags[i];
		if (fl & 2) { int v = *p++; x += (fl & 16) ? v : -v; }
		else if (!(fl & 16)) { x += rds16(p); p += 2; }
		xs[i] = x;
	}
	for (uint16_t i = 0; i < nPts; i++) {
		uint8_t fl = flags[i];
		if (fl & 4) { int v = *p++; y += (fl & 32) ? v : -v; }
		else if (!(fl & 32)) { y += rds16(p); p += 2; }
		ys[i] = y;
	}

#define TX(px,py) (m00*(px) + m01*(py) + dx)
#define TY(px,py) (m10*(px) + m11*(py) + dy)

	uint16_t start = 0;
	for (int c = 0; c < nContours; c++) {
		uint16_t end = ends[c];
		if (end < start || end >= nPts) { start = end + 1; continue; }
		if (!outline_add_contour(o)) break;
		uint16_t m = end - start + 1;
		if (m == 0) { start = end + 1; continue; }

		/*
		 * Expand the contour into an alternating on/off list:
		 * insert implied on-curve midpoints between consecutive
		 * off-curve points (circular). Then walk emitting lines
		 * (on->on) and flattened quads (on->off->on).
		 */
		/* B"H: ex/ey/eon reuse the arena workspace (cap <= wsCap). */
		uint16_t ne = 0;
		for (uint16_t i = 0; i < m; i++) {
			uint16_t a = start + i;
			uint16_t b = start + ((i + 1) % m);
			ex[ne] = xs[a]; ey[ne] = ys[a]; eon[ne] = (flags[a] & 1) ? 1 : 0;
			ne++;
			if (!(flags[a] & 1) && !(flags[b] & 1)) {
				ex[ne] = (xs[a] + xs[b]) * 0.5f;
				ey[ne] = (ys[a] + ys[b]) * 0.5f;
				eon[ne] = 1;
				ne++;
			}
		}
		/* First on-curve index. */
		uint16_t fi2 = 0;
		while (fi2 < ne && !eon[fi2]) fi2++;
		if (fi2 >= ne) { start = end + 1; continue; }
		if (!outline_push(o, TX(ex[fi2], ey[fi2]), TY(ex[fi2], ey[fi2]), 1)) {
			break;
		}
		uint16_t i2 = fi2;
		for (uint16_t k = 0; k < ne; k++) {
			uint16_t j = (i2 + 1) % ne;
			if (j == fi2) break;
			if (eon[j]) {
				if (!outline_push(o, TX(ex[j], ey[j]), TY(ex[j], ey[j]), 1)) break;
				i2 = j;
			} else {
				uint16_t kk = (j + 1) % ne;
				float sx = o->pts[o->nPts - 1].x, sy = o->pts[o->nPts - 1].y;
				if (!flatten_quad(o, sx, sy,
						TX(ex[j], ey[j]), TY(ex[j], ey[j]),
						TX(ex[kk], ey[kk]), TY(ex[kk], ey[kk]), 0)) break;
				i2 = kk;
				if (kk == fi2) break;
			}
		}
		o->contourEnds[o->nContours - 1] = (uint16_t)(o->nPts - 1);
		start = end + 1;
	}
#undef TX
#undef TY
	free(arena);
	return 1;
}

static int decode_glyph_full(const AwtsTtfFace* f, uint16_t glyph, Outline* o,
		float m00, float m01, float m10, float m11, float dx, float dy, int depth) {
	if (depth > 8) return 1;
	uint32_t off = glyph_offset(f, glyph);
	if (off == 0) return 1;
	const uint8_t* g = f->glyf + off;
	if (!in_range(f, g, 10)) return 0;
	int16_t nContours = rds16(g);
	if (nContours == 0) return 1;
	if (nContours > 0)
		return decode_simple(g, o, m00, m01, m10, m11, dx, dy);
	/* composite */
	{
		const uint8_t* p = g + 10;
		for (;;) {
			if (!in_range(f, p, 4)) return 0;
			uint16_t flags = rd16(p), comp = rd16(p + 2);
			p += 4;
			float ax = 0, ay = 0;
			if (flags & 1) {
				if (!in_range(f, p, 4)) return 0;
				ax = (flags & 2) ? rds16(p) : (int16_t)rd16(p);
				ay = (flags & 2) ? rds16(p + 2) : (int16_t)rd16(p + 2);
				p += 4;
			} else {
				if (!in_range(f, p, 2)) return 0;
				ax = (flags & 2) ? (int8_t)p[0] : (uint8_t)p[0];
				ay = (flags & 2) ? (int8_t)p[1] : (uint8_t)p[1];
				p += 2;
			}
			float c00 = 1, c01 = 0, c10 = 0, c11 = 1;
			if (flags & 8) {
				if (!in_range(f, p, 2)) return 0;
				c00 = c11 = rds16(p) / 16384.0f; p += 2;
			} else if (flags & 64) {
				if (!in_range(f, p, 4)) return 0;
				c00 = rds16(p) / 16384.0f; c11 = rds16(p + 2) / 16384.0f; p += 4;
			} else if (flags & 128) {
				if (!in_range(f, p, 8)) return 0;
				c00 = rds16(p) / 16384.0f; c01 = rds16(p + 2) / 16384.0f;
				c10 = rds16(p + 4) / 16384.0f; c11 = rds16(p + 6) / 16384.0f;
				p += 8;
			}
			float n00 = m00 * c00 + m01 * c10;
			float n01 = m00 * c01 + m01 * c11;
			float n10 = m10 * c00 + m11 * c10;
			float n11 = m10 * c01 + m11 * c11;
			float ndx = m00 * ax + m01 * ay + dx;
			float ndy = m10 * ax + m11 * ay + dy;
			if (!decode_glyph_full(f, comp, o, n00, n01, n10, n11, ndx, ndy, depth + 1))
				return 0;
			if (!(flags & 32)) break;
		}
		return 1;
	}
}

/* ---------- scanline rasterizer with 4x SSAA ---------- */

typedef struct { float x0, y0, x1, y1; } Edge;

static int cmp_edge_x0(const void* a, const void* b) {
	float d = ((const Edge*)a)->x0 - ((const Edge*)b)->x0;
	return d < 0 ? -1 : d > 0 ? 1 : 0;
}

/*
 * Fills the outline into a 4x-supersampled coverage grid, then box-downsamples
 * to out[0..outW*outH). Coordinates are in output pixels (already scaled).
 */
static void rasterize_outline(const Outline* o, uint8_t* out, int outW, int outH) {
	const int SS = 4;
	int sw = outW * SS, sh = outH * SS;
	if (sw <= 0 || sh <= 0 || outW <= 0 || outH <= 0) return;

	/* Build edge list in supersampled space.
	   B"H: edges and the xs scratch share ONE block (was 2 mallocs). */
	size_t ecap = 1024, ne = 0;
	uint8_t* ebuf = (uint8_t*)malloc(ecap * (sizeof(Edge) + sizeof(float)));
	if (!ebuf) return;
	Edge* edges = (Edge*)ebuf;
	float* xs = (float*)(ebuf + ecap * sizeof(Edge));
	size_t cstart = 0;
	for (size_t c = 0; c < o->nContours; c++) {
		size_t cend = o->contourEnds[c];
		if (cend < cstart || cend >= o->nPts) { cstart = cend + 1; continue; }
		for (size_t i = cstart; i <= cend; i++) {
			size_t j = (i == cend) ? cstart : i + 1;
			float x0 = o->pts[i].x * SS, y0 = o->pts[i].y * SS;
			float x1 = o->pts[j].x * SS, y1 = o->pts[j].y * SS;
			if (y0 == y1) continue; /* horizontal: no scanline crossing */
			if (ne >= ecap) {
				ecap *= 2;
				uint8_t* nb = (uint8_t*)realloc(ebuf,
					ecap * (sizeof(Edge) + sizeof(float)));
				if (!nb) { free(ebuf); return; }
				ebuf = nb;
				edges = (Edge*)ebuf;
				xs = (float*)(ebuf + ecap * sizeof(Edge));
			}
			edges[ne].x0 = x0; edges[ne].y0 = y0;
			edges[ne].x1 = x1; edges[ne].y1 = y1;
			ne++;
		}
		cstart = cend + 1;
	}

	/* Supersampled coverage accumulation. */
	uint16_t* acc = (uint16_t*)calloc((size_t)sw * sh, sizeof(uint16_t));
	if (!acc) { free(ebuf); return; }

	for (int sy = 0; sy < sh; sy++) {
		float y = sy + 0.5f;
		size_t nx = 0;
		for (size_t e = 0; e < ne; e++) {
			float y0 = edges[e].y0, y1 = edges[e].y1;
			if ((y0 <= y && y < y1) || (y1 <= y && y < y0)) {
				float t = (y - y0) / (y1 - y0);
				xs[nx++] = edges[e].x0 + t * (edges[e].x1 - edges[e].x0);
			}
		}
		/* insertion sort (small n typical) */
		for (size_t i = 1; i < nx; i++) {
			float v = xs[i]; size_t j = i;
			while (j > 0 && xs[j - 1] > v) { xs[j] = xs[j - 1]; j--; }
			xs[j] = v;
		}
		for (size_t i = 0; i + 1 < nx; i += 2) {
			int x0 = (int)(xs[i] + 0.5f), x1 = (int)(xs[i + 1] + 0.5f);
			if (x0 < 0) x0 = 0;
			if (x1 > sw) x1 = sw;
			for (int x = x0; x < x1; x++) acc[sy * sw + x]++;
		}
	}

	/* Box downsample 4x4 -> 8-bit coverage. */
	for (int y = 0; y < outH; y++) {
		for (int x = 0; x < outW; x++) {
			int sum = 0;
			for (int dy = 0; dy < SS; dy++)
				for (int dx = 0; dx < SS; dx++)
					sum += acc[(y * SS + dy) * sw + x * SS + dx] ? 1 : 0;
			/* acc holds nonzero counts from even-odd pairs; any hit = covered */
			out[y * outW + x] = (uint8_t)((sum * 255 + 8) / 16);
		}
	}
	free(acc); free(ebuf);
	(void)cmp_edge_x0;
}

/* ---------- public rasterize ---------- */

int awts_ttf_rasterize(const AwtsTtfFace* face, uint16_t glyph, int pixelHeight,
	uint8_t* out, int outStride,
	int* outW, int* outH, int* bearingX, int* bearingY, float* advance) {
	if (!face || !face->ok || !out || pixelHeight <= 0 || pixelHeight > 512)
		return 0;
	if (glyph == 0 || glyph >= face->numGlyphs) return 0;

	Outline o;
	memset(&o, 0, sizeof(o));
	/* y-flip: font units have y-up; output has y-down. */
	float s = (float)pixelHeight / (float)face->unitsPerEm;
	if (!decode_glyph_full(face, glyph, &o, s, 0, 0, -s, 0, 0, 0)) {
		outline_free(&o);
		return 0;
	}
	if (o.nPts == 0) { outline_free(&o); return 0; }

	/* Bounds in output pixels. */
	float minX = 1e30f, minY = 1e30f, maxX = -1e30f, maxY = -1e30f;
	for (size_t i = 0; i < o.nPts; i++) {
		if (o.pts[i].x < minX) minX = o.pts[i].x;
		if (o.pts[i].x > maxX) maxX = o.pts[i].x;
		if (o.pts[i].y < minY) minY = o.pts[i].y;
		if (o.pts[i].y > maxY) maxY = o.pts[i].y;
	}
	/* Pad 1px for antialias bleed. */
	int ix0 = (int)minX - 1, iy0 = (int)minY - 1;
	int ix1 = (int)(maxX + 1.999f) + 1, iy1 = (int)(maxY + 1.999f) + 1;
	int w = ix1 - ix0, h = iy1 - iy0;
	/* B"H: cap at 512px so the caller's scratch (256KB) always suffices. */
	if (w <= 0 || h <= 0 || w > 512 || h > 512) { outline_free(&o); return 0; }

	/* Shift outline so bitmap origin is (ix0,iy0). */
	for (size_t i = 0; i < o.nPts; i++) {
		o.pts[i].x -= ix0;
		o.pts[i].y -= iy0;
	}

	int stride = outStride ? outStride : w;
	if (stride == w) {
		/* B"H: raster directly into the caller's buffer (no temp copy). */
		memset(out, 0, (size_t)w * h);
		rasterize_outline(&o, out, w, h);
	} else {
		uint8_t* tmp = (uint8_t*)malloc((size_t)w * h);
		if (!tmp) { outline_free(&o); return 0; }
		memset(tmp, 0, (size_t)w * h);
		rasterize_outline(&o, tmp, w, h);
		for (int y = 0; y < h; y++)
			memcpy(out + (size_t)y * stride, tmp + (size_t)y * w, (size_t)w);
		free(tmp);
	}
	outline_free(&o);

	if (outW) *outW = w;
	if (outH) *outH = h;
	if (bearingX) *bearingX = ix0;
	if (bearingY) *bearingY = iy0;
	if (advance) {
		int advUnits = awts_ttf_advance(face, glyph);
		*advance = advUnits * s;
	}
	return 1;
}

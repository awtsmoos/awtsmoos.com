/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_vm.h"
#include "merkava_android_text.h"

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

/* ------------------------------------------------------------------ */
/* Bytecode reader.                                                    */
/* ------------------------------------------------------------------ */

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

/* Minimal JSON string extractor for the manifest. */
static char* manifest_string(const uint8_t* bytes, size_t len, const char* key) {
	if (!bytes || !len || !key) return NULL;
	size_t keyLen = strlen(key);
	size_t patLen = keyLen + 4;
	char pat[128];
	if (patLen >= sizeof(pat)) return NULL;
	pat[0] = '"';
	memcpy(pat + 1, key, keyLen);
	memcpy(pat + 1 + keyLen, "\":\"", 3);
	pat[patLen] = 0;
	for (size_t i = 0; i + patLen < len; i++) {
		if (memcmp(bytes + i, pat, patLen) == 0) {
			size_t v = i + patLen;
			size_t e = v;
			while (e < len && bytes[e] != '"') {
				if (bytes[e] == '\\' && e + 1 < len) e++;
				e++;
			}
			size_t vlen = e - v;
			char* found = (char*)malloc(vlen + 1);
			if (found) { memcpy(found, bytes + v, vlen); found[vlen] = 0; }
			return found;
		}
	}
	return NULL;
}

static int parse_hex_color(const char* s, float* r, float* g, float* b) {
	unsigned int rv, gv, bv;
	if (!s || s[0] != '#' || strlen(s) < 7) return 0;
	if (sscanf(s + 1, "%2x%2x%2x", &rv, &gv, &bv) != 3) return 0;
	*r = rv / 255.0f; *g = gv / 255.0f; *b = bv / 255.0f;
	return 1;
}

static int is_heading_tag(const char* tag) {
	return tag && (strcmp(tag, "h1") == 0 || strcmp(tag, "h2") == 0 ||
		strcmp(tag, "h3") == 0 || strcmp(tag, "h4") == 0 ||
		strcmp(tag, "h5") == 0 || strcmp(tag, "h6") == 0);
}

static int is_button_tag(const char* tag) {
	return tag && (strcmp(tag, "button") == 0);
}

/* ------------------------------------------------------------------ */
/* VM lifecycle.                                                       */
/* ------------------------------------------------------------------ */

AwtsVm* awts_vm_create(void) {
	AwtsVm* vm = (AwtsVm*)calloc(1, sizeof(AwtsVm));
	if (!vm) return NULL;
	vm->layoutDirty = 1;
	return vm;
}

static AwtsVmNode* vm_new_node(AwtsVm* vm, uint32_t handle) {
	AwtsVmNode* node = (AwtsVmNode*)calloc(1, sizeof(AwtsVmNode));
	if (!node) return NULL;
	node->handle = handle;
	node->r = 0.96f; node->g = 0.96f; node->b = 0.98f;

	if (vm->nodeCount == vm->nodeCap) {
		size_t ncap = vm->nodeCap ? vm->nodeCap * 2 : 64;
		AwtsVmNode** grown = (AwtsVmNode**)realloc(vm->nodes,
			ncap * sizeof(AwtsVmNode*));
		if (!grown) { free(node); return NULL; }
		vm->nodes = grown;
		vm->nodeCap = ncap;
	}
	vm->nodes[vm->nodeCount++] = node;
	if (!vm->root) vm->root = node;
	return node;
}

static void vm_add_child(AwtsVmNode* parent, AwtsVmNode* child) {
	if (!parent || !child) return;
	if (parent->childCount == parent->childCap) {
		size_t ncap = parent->childCap ? parent->childCap * 2 : 8;
		AwtsVmNode** grown = (AwtsVmNode**)realloc(parent->children,
			ncap * sizeof(AwtsVmNode*));
		if (!grown) return;
		parent->children = grown;
		parent->childCap = ncap;
	}
	parent->children[parent->childCount++] = child;
	child->parent = parent;
}

AwtsVmNode* awts_vm_find(AwtsVm* vm, uint32_t handle) {
	if (!vm) return NULL;
	for (size_t i = 0; i < vm->nodeCount; i++) {
		if (vm->nodes[i]->handle == handle) return vm->nodes[i];
	}
	return NULL;
}

static AwtsVmNode* vm_find_by_id(AwtsVm* vm, const char* id) {
	if (!vm || !id) return NULL;
	for (size_t i = 0; i < vm->nodeCount; i++) {
		if (vm->nodes[i]->id && strcmp(vm->nodes[i]->id, id) == 0)
			return vm->nodes[i];
	}
	return NULL;
}

void awts_vm_set_text(AwtsVm* vm, AwtsVmNode* node, const char* text) {
	if (!vm || !node) return;
	free(node->text);
	node->text = dup_str(text);
	vm->layoutDirty = 1;
}

static void vm_bind_event(AwtsVm* vm, uint32_t targetHandle,
		const char* event, uint32_t actionTargetHandle, const char* value) {
	if (vm->eventCount == vm->eventCap) {
		size_t ncap = vm->eventCap ? vm->eventCap * 2 : 16;
		AwtsVmEvent* grown = (AwtsVmEvent*)realloc(vm->events,
			ncap * sizeof(AwtsVmEvent));
		if (!grown) return;
		vm->events = grown;
		vm->eventCap = ncap;
	}
	AwtsVmEvent* e = &vm->events[vm->eventCount++];
	memset(e, 0, sizeof(*e));
	e->targetHandle = targetHandle;
	e->event = dup_str(event);
	e->actionTargetHandle = actionTargetHandle;
	e->value = dup_str(value);
}

/* ------------------------------------------------------------------ */
/* Bytecode execution: MWB4 ops build the live DOM.                    */
/* ------------------------------------------------------------------ */

int awts_vm_execute(AwtsVm* vm,
		const uint8_t* mwb4, size_t mwb4Len,
		const uint8_t* manifestBytes, size_t manifestLen) {
	if (!vm || !mwb4 || mwb4Len < 6) return 0;
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

	while (r.at < codeEnd && !r.failed) {
		uint32_t op = read_u8(&r);
		if (r.failed) break;
		if (op == MWB4_OP_END) break;

		if (op == MWB4_OP_CREATE_NODE) {
			uint32_t handle = read_varuint(&r);
			uint32_t parentHandle = read_varuint(&r);
			uint32_t tagIdx = read_varuint(&r);
			uint32_t idIdx = read_varuint(&r);
			uint32_t textIdx = read_varuint(&r);
			const char* tag = tagIdx < poolCount ? pool[tagIdx] : "";
			const char* id = idIdx < poolCount ? pool[idIdx] : "";
			const char* text = textIdx < poolCount ? pool[textIdx] : "";

			AwtsVmNode* node = vm_new_node(vm, handle);
			if (!node) break;
			node->tag = dup_str(tag);
			if (id && *id) node->id = dup_str(id);
			if (text && *text) node->text = dup_str(text);
			node->isHeading = is_heading_tag(tag);
			node->isButton = is_button_tag(tag);

			if (parentHandle != 0) {
				AwtsVmNode* parent = awts_vm_find(vm, parentHandle);
				if (parent) vm_add_child(parent, node);
			}
		} else if (op == MWB4_OP_SET_ATTR) {
			uint32_t handle = read_varuint(&r);
			uint32_t nameIdx = read_varuint(&r);
			uint32_t valIdx = read_varuint(&r);
			const char* name = nameIdx < poolCount ? pool[nameIdx] : "";
			const char* val = valIdx < poolCount ? pool[valIdx] : "";
			AwtsVmNode* node = awts_vm_find(vm, handle);
			if (node && name && val) {
				if (strcmp(name, "id") == 0) {
					free(node->id);
					node->id = dup_str(val);
				}
			}
		} else if (op == MWB4_OP_SET_STYLE) {
			uint32_t selIdx = read_varuint(&r);
			uint32_t propIdx = read_varuint(&r);
			uint32_t valIdx = read_varuint(&r);
			const char* sel = selIdx < poolCount ? pool[selIdx] : "";
			const char* prop = propIdx < poolCount ? pool[propIdx] : "";
			const char* val = valIdx < poolCount ? pool[valIdx] : "";
			if (sel && sel[0] == '#' && prop && strcmp(prop, "color") == 0) {
				AwtsVmNode* node = vm_find_by_id(vm, sel + 1);
				if (node) parse_hex_color(val, &node->r, &node->g, &node->b);
			}
		} else if (op == MWB4_OP_SET_STYLE_HANDLE) {
			uint32_t handle = read_varuint(&r);
			uint32_t propIdx = read_varuint(&r);
			uint32_t valIdx = read_varuint(&r);
			const char* prop = propIdx < poolCount ? pool[propIdx] : "";
			const char* val = valIdx < poolCount ? pool[valIdx] : "";
			AwtsVmNode* node = awts_vm_find(vm, handle);
			if (node && prop && strcmp(prop, "color") == 0) {
				parse_hex_color(val, &node->r, &node->g, &node->b);
			}
		} else if (op == MWB4_OP_BIND_TEXT_EVENT) {
			uint32_t targetHandle = read_varuint(&r);
			uint32_t eventIdx = read_varuint(&r);
			uint32_t actionTargetHandle = read_varuint(&r);
			uint32_t valueIdx = read_varuint(&r);
			const char* event = eventIdx < poolCount ? pool[eventIdx] : "click";
			const char* value = valueIdx < poolCount ? pool[valueIdx] : "";
			vm_bind_event(vm, targetHandle, event, actionTargetHandle, value);
		} else {
			break; /* unknown opcode: stop, keep what we decoded */
		}
	}

	vm->appName = manifest_string(manifestBytes, manifestLen, "name");
	vm->layoutDirty = 1;
	vm->ok = 1;

	for (uint32_t i = 0; i < poolCount; i++) free(pool[i]);
	free(pool);
	return 1;
}

/* ------------------------------------------------------------------ */
/* Layout: block layout with text measurement.                         */
/* ------------------------------------------------------------------ */

/* Measures how many lines a text needs at the given width and scale. */
static int count_lines(const char* text, float scale, float maxW, int bold) {
	if (!text || !*text) return 0;
	float spaceW = bold ? awts_text_width_bold(" ", scale)
	                    : awts_text_width(" ", scale);
	int lines = 1;
	float w = 0.0f;
	const char* p = text;
	while (*p) {
		while (*p == ' ') p++;
		if (!*p) break;
		if (*p == '\n') { lines++; w = 0.0f; p++; continue; }
		const char* wordEnd = p;
		while (*wordEnd && *wordEnd != ' ' && *wordEnd != '\n') wordEnd++;
		float wordW = bold
			? awts_text_width_n_bold(p, (size_t)(wordEnd - p), scale)
			: awts_text_width_n(p, (size_t)(wordEnd - p), scale);
		float add = (w > 0.0f ? spaceW : 0.0f) + wordW;
		if (w + add > maxW && w > 0.0f) { lines++; w = 0.0f; }
		else w += add;
		p = wordEnd;
	}
	return lines;
}

static float node_scale(AwtsVmNode* node) {
	if (node->isHeading) return 3.5f;
	if (node->isButton) return 2.75f;
	return 2.5f;
}

static int node_bold(AwtsVmNode* node) {
	return node->isHeading || node->isButton;
}

/* Lays out one node and its children; returns the y for the next sibling. */
static float layout_node(AwtsVm* vm, AwtsVmNode* node,
		float x, float y, float w) {
	(void)vm;
	float scale = node_scale(node);
	float lineH = 8.0f * scale * 1.35f;
	float padY = node->isButton ? 12.0f : 6.0f;

	node->x = x;
	node->y = y;
	node->w = w;

	float contentY = y + padY;
	float contentW = w - 32.0f; /* 16px padding each side */

	if (node->text && *node->text) {
		int lines = count_lines(node->text, scale, contentW, node_bold(node));
		if (lines < 1) lines = 1;
		contentY += lines * lineH;
	}

	/* Children stack below. */
	float childY = contentY + padY;
	for (size_t i = 0; i < node->childCount; i++) {
		childY = layout_node(vm, node->children[i], x + 16.0f, childY, w - 16.0f);
		childY += 4.0f;
	}

	node->h = (childY > contentY + padY ? childY : contentY + padY) - y;
	if (node->h < lineH) node->h = lineH;
	return y + node->h + 8.0f;
}

void awts_vm_layout(AwtsVm* vm, float viewportW) {
	if (!vm || !vm->root) return;
	float y = 0.0f;
	/* Lay out top-level nodes (children of root, or root itself). */
	if (vm->root->childCount > 0) {
		for (size_t i = 0; i < vm->root->childCount; i++) {
			y = layout_node(vm, vm->root->children[i], 0, y, viewportW);
		}
		vm->root->x = 0; vm->root->y = 0;
		vm->root->w = viewportW; vm->root->h = y;
	} else {
		layout_node(vm, vm->root, 0, 0, viewportW);
	}
	vm->layoutDirty = 0;
}

/* ------------------------------------------------------------------ */
/* Input: hit testing and event dispatch.                              */
/* ------------------------------------------------------------------ */

static AwtsVmNode* hit_test(AwtsVmNode* node, float x, float y) {
	if (!node) return NULL;
	/* Check children first (topmost last = reverse order). */
	for (size_t i = node->childCount; i > 0; i--) {
		AwtsVmNode* hit = hit_test(node->children[i - 1], x, y);
		if (hit) return hit;
	}
	if (x >= node->x && x < node->x + node->w &&
	    y >= node->y && y < node->y + node->h) {
		return node;
	}
	return NULL;
}

int awts_vm_tap(AwtsVm* vm, float x, float y) {
	if (!vm || !vm->root) return 0;
	if (vm->layoutDirty) return 0; /* layout must run first */

	AwtsVmNode* hit = hit_test(vm->root, x, y);
	if (!hit) return 0;

	int fired = 0;
	for (size_t i = 0; i < vm->eventCount; i++) {
		AwtsVmEvent* e = &vm->events[i];
		if (e->targetHandle == hit->handle &&
		    e->event && strcmp(e->event, "click") == 0) {
			AwtsVmNode* target = awts_vm_find(vm, e->actionTargetHandle);
			if (target) {
				awts_vm_set_text(vm, target, e->value ? e->value : "");
				fired = 1;
			}
		}
	}
	return fired;
}

/* ------------------------------------------------------------------ */
/* Cleanup.                                                            */
/* ------------------------------------------------------------------ */

static void free_node(AwtsVmNode* node) {
	if (!node) return;
	for (size_t i = 0; i < node->childCount; i++) free_node(node->children[i]);
	free(node->children);
	free(node->tag);
	free(node->id);
	free(node->text);
	free(node);
}

void awts_vm_free(AwtsVm* vm) {
	if (!vm) return;
	/* Nodes are freed via the root tree; but nodes not under root
	   (orphans) are in vm->nodes. Free via vm->nodes to be safe,
	   avoiding double-free by tracking. */
	for (size_t i = 0; i < vm->nodeCount; i++) {
		AwtsVmNode* n = vm->nodes[i];
		/* Only free if not a child of another node (avoid double free). */
		if (!n->parent) free_node(n);
	}
	free(vm->nodes);
	for (size_t i = 0; i < vm->eventCount; i++) {
		free(vm->events[i].event);
		free(vm->events[i].value);
	}
	free(vm->events);
	free(vm->appName);
	free(vm);
}

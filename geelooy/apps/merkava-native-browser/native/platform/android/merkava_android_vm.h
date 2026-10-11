/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_VM_H
#define AWTS_MERKAVA_ANDROID_VM_H

#include <stddef.h>
#include <stdint.h>

/**
 * The Merkava VM: a live DOM built by executing MWB4 bytecode.
 *
 * Unlike the static text extractor (merkava_android_mwb4), this VM maintains
 * a mutable DOM tree. BIND_TEXT_EVENT ops create live event bindings; when
 * the user taps a bound node, the VM executes the action (set text on the
 * target node) and marks the layout dirty so the next frame re-renders.
 *
 * This is the same execution path as NativeAppRunner.js on the JS side:
 * MWB4 opcodes build the DOM, events mutate it, the renderer paints it.
 *
 * MEMORY DESIGN (B"H — every byte used):
 * - Tag names are INTERNED: one static copy per tag name shared by all
 *   nodes. No per-node tag malloc. Unknown tags are dup'd once and flagged.
 * - Node flags (heading/button/tag-owned) packed into ONE byte.
 * - Struct field order chosen to eliminate padding: 88 bytes/node
 *   (was 96 + one malloc per node for the tag).
 * - Event names are a 1-byte kind enum, not a dup'd string.
 */

/* Forward declarations. */
typedef struct AwtsVm AwtsVm;
typedef struct AwtsVmNode AwtsVmNode;

/* Node flag bits. */
#define AWTS_VM_FLAG_HEADING   0x01u
#define AWTS_VM_FLAG_BUTTON    0x02u
#define AWTS_VM_FLAG_TAG_OWNED 0x04u /* tag was dup'd (not interned) */

/* Event kinds. */
#define AWTS_VM_EVENT_CLICK 0u

/** A DOM node in the live tree: 88 bytes. */
struct AwtsVmNode {
	/* 8-byte fields first: zero padding. */
	AwtsVmNode* parent;
	AwtsVmNode** children;
	char* text;              /* Text content (may be NULL). Owned. */
	char* id;                /* id attribute (may be NULL). Owned. */
	const char* tag;         /* Interned static string, or owned if
	                            AWTS_VM_FLAG_TAG_OWNED. Never NULL. */
	/* B"H: 32-bit child counts (a node can never have 4B children —
	   the array alone would need 32GB). Saves 8 bytes -> node is 88. */
	uint32_t childCount;
	uint32_t childCap;

	/* 4-byte fields. */
	float x, y, w, h;        /* Bounds in pixels. */
	float r, g, b;           /* Resolved text color. */
	uint32_t handle;         /* MWB4 handle (unique per node). */

	/* 1-byte tail. */
	uint8_t flags;           /* AWTS_VM_FLAG_* bits. */
	/* 3 bytes implicit tail padding -> 88 total. */
};

/** A bound text-mutation event (from BIND_TEXT_EVENT): 24 bytes. */
typedef struct AwtsVmEvent {
	char* value;                 /* New text value. Owned. */
	uint32_t targetHandle;       /* Node that receives the tap. */
	uint32_t actionTargetHandle; /* Node whose text gets replaced. */
	uint8_t eventKind;           /* AWTS_VM_EVENT_* (1 byte, not a string). */
	/* 7 bytes implicit tail padding -> 24 total. */
} AwtsVmEvent;

/** The VM instance. */
struct AwtsVm {
	AwtsVmNode** nodes;      /* All nodes indexed by position. */
	size_t nodeCount;
	size_t nodeCap;

	AwtsVmEvent* events;     /* Event bindings. */
	size_t eventCount;
	size_t eventCap;

	AwtsVmNode* root;        /* Root node (first created). */
	char* appName;           /* From container manifest. */

	int layoutDirty;         /* 1 when DOM changed and layout must re-run. */
	int ok;
};

/**
 * Creates a new VM instance. Returns NULL on allocation failure.
 */
AwtsVm* awts_vm_create(void);

/**
 * Executes MWB4 bytecode to build the live DOM.
 * manifestBytes/manifestLen: raw MANIFEST section for app name (may be NULL).
 * Returns 1 on success.
 */
int awts_vm_execute(AwtsVm* vm,
	const uint8_t* mwb4, size_t mwb4Len,
	const uint8_t* manifestBytes, size_t manifestLen);

/**
 * Computes layout for all nodes given the viewport width.
 * Must be called before rendering or hit-testing.
 * Uses the text renderer's width functions for measurement.
 */
void awts_vm_layout(AwtsVm* vm, float viewportW);

/**
 * Dispatches a tap at (x, y). Hit-tests against laid-out nodes,
 * fires matching "click" event bindings (set-text actions).
 * Returns 1 if an event was fired (caller should re-render).
 */
int awts_vm_tap(AwtsVm* vm, float x, float y);

/**
 * Finds a node by its MWB4 handle. Returns NULL if not found.
 */
AwtsVmNode* awts_vm_find(AwtsVm* vm, uint32_t handle);

/**
 * Sets a node's text content. Marks layout dirty.
 */
void awts_vm_set_text(AwtsVm* vm, AwtsVmNode* node, const char* text);

/**
 * Frees the VM and all its nodes.
 */
void awts_vm_free(AwtsVm* vm);

#endif

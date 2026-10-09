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
 */

/* Forward declarations. */
typedef struct AwtsVm AwtsVm;
typedef struct AwtsVmNode AwtsVmNode;

/** A DOM node in the live tree. */
struct AwtsVmNode {
	uint32_t handle;        /* MWB4 handle (unique per node). */
	char* tag;              /* e.g. "div", "h1", "button", "p". */
	char* id;               /* id attribute (may be NULL). */
	char* text;             /* Text content (may be NULL). */
	float r, g, b;          /* Resolved text color. */
	int isHeading;          /* 1 for h1..h6. */
	int isButton;           /* 1 for button/input[type=button]. */

	/* Tree links. */
	AwtsVmNode* parent;
	AwtsVmNode** children;
	size_t childCount;
	size_t childCap;

	/* Layout (computed by awts_vm_layout). */
	float x, y, w, h;       /* Bounds in pixels. */
};

/** A bound text-mutation event (from BIND_TEXT_EVENT). */
typedef struct AwtsVmEvent {
	uint32_t targetHandle;       /* Node that receives the tap. */
	char* event;                 /* Event name, e.g. "click". */
	uint32_t actionTargetHandle; /* Node whose text gets replaced. */
	char* value;                 /* New text value. */
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

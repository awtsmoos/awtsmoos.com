/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_BROWSER_H
#define AWTS_MERKAVA_BROWSER_H

#include <GLES3/gl3.h>
#include <stddef.h>

#include "../common/merkava_html.h"
#include "../common/merkava_css.h"
#include "merkava_android_text.h"

#include <pthread.h>

struct android_app;

/* Browser chrome metrics (pixels). */
#define AWTS_BROWSER_TAB_H 64.0f
#define AWTS_BROWSER_URL_H 76.0f
#define AWTS_BROWSER_CHROME_H \
	(AWTS_BROWSER_TAB_H + AWTS_BROWSER_URL_H)
#define AWTS_BROWSER_MAX_TABS 4
#define AWTS_BROWSER_MAX_LINKS 256

/* A clickable link rect recorded during layout. */
typedef struct {
	float x, y, w, h;
	char href[1024];
} AwtsBrowserLink;

/* Chrome hit rects (tabs, address bar, keyboard). */
typedef struct {
	float x, y, w, h;
	int tabIndex;   /* -1 = not a tab */
	int kind;       /* 0=tab, 1=newtab, 2=closetab, 3=urlbar, 4=key */
	int keyIndex;   /* for kind 4 */
} AwtsBrowserHit;

/* One tab: a fetched page. */
typedef struct {
	char url[2048];       /* requested URL */
	char finalUrl[2048];  /* post-redirect URL */
	AwtsHtmlDoc doc;
	AwtsCssSheet sheet;   /* parsed <style> (v2) */
	int hasSheet;
	float scrollY;
	float contentH;       /* measured content height */
	int hasPage;
	int loading;          /* 1=loading, 2=pending navigation */
	int fresh;            /* 1=new tab, never navigated */
	unsigned fetchSeq;    /* bumped per navigate; stale slots drop */
	char status[256];
	AwtsBrowserLink links[AWTS_BROWSER_MAX_LINKS];
	int linkCount;
} AwtsBrowserTab;

#define AWTS_BROWSER_MAX_HITS 64
#define AWTS_BROWSER_EDIT_CAP 2048
#define AWTS_BROWSER_MAX_FETCH 4

/* One in-flight background fetch. Slots are fixed (never memmove'd);
 * the worker thread fills its slot, the main loop applies it. */
typedef struct {
	pthread_mutex_t mu;
	int inUse;
	int tabIndex;      /* tab this fetch belongs to */
	unsigned fetchSeq; /* tab's sequence at navigate time */
	char url[2048];
	void* vm;          /* JavaVM* (opaque here; cast at use) */
	/* Result (valid when ready==1; guarded by mu). */
	int ready;
	int ok;
	uint8_t* bytes;
	size_t len;
	char finalUrl[2048];
} AwtsFetchSlot;

/* Browser state: tabs + chrome + quad renderer. */
typedef struct {
	AwtsBrowserTab tabs[AWTS_BROWSER_MAX_TABS];
	int tabCount;
	int active;
	/* Rounded-rect quad renderer for chrome. */
	GLuint quadProgram;
	GLuint quadVbo;
	GLint quadURes;
	GLint quadURect;
	GLint quadURadius;
	GLint quadUColor;
	int quadOk;
	int vpW, vpH;
	/* Touch state. */
	int touching;
	float touchStartX, touchStartY;
	float touchStartScroll;
	float lastX, lastY;
	/* Chrome hit rects from the last render. */
	AwtsBrowserHit hits[AWTS_BROWSER_MAX_HITS];
	int hitCount;
	/* On-screen keyboard (address bar input). */
	int keyboardOpen;
	char editBuf[AWTS_BROWSER_EDIT_CAP];
	int editLen;
	AwtsBrowserHit keyHits[64];
	int keyHitCount;
	float kbY;          /* keyboard top (screen coords) */
	/* Background fetch slots. */
	AwtsFetchSlot fetch[AWTS_BROWSER_MAX_FETCH];
} AwtsBrowser;

int awts_browser_init(AwtsBrowser* b);
void awts_browser_shutdown(AwtsBrowser* b);

/** Applies completed background fetches to their tabs. Call each frame. */
void awts_browser_poll(AwtsBrowser* b);

/** Tab management. Returns tab index or -1. */
int awts_browser_new_tab(AwtsBrowser* b);
void awts_browser_close_tab(AwtsBrowser* b, int index);
void awts_browser_switch_tab(AwtsBrowser* b, int index);

/** Fetches + parses a URL into the active tab (blocking). */
void awts_browser_navigate(AwtsBrowser* b, struct android_app* app,
	const char* url);

/** Normalizes address-bar text to a URL (adds https:// if missing). */
void awts_browser_normalize_url(const char* text, char* out, size_t cap);

/** Renders chrome + active page. */
void awts_browser_render(AwtsBrowser* b, AwtsTextRenderer* tr,
	int vpW, int vpH);

/** Touch input: returns 1 if consumed. */
int awts_browser_touch(AwtsBrowser* b, int action, float x, float y);
/* action: 0=down, 1=move, 2=up */

#endif

/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include <GL/gl.h>
#include <GL/glx.h>
#include <X11/Xlib.h>
#include <stdio.h>

#include "../../canonical/merkava_container.h"
#include "../common/merkava_file_loader.h"

/** Verifies canonical bytes before Linux display or graphics capabilities open. */
static int verify_application(const char* path) {
	AwtsFileBytes file;
	if (!awts_read_file_bytes(path, &file)) {
		return 0;
	}
	AwtsMerkavaContainer container;
	int valid = awts_mkv_open(file.bytes, file.length, &container);
	awts_free_file_bytes(&file);
	return valid;
}

/** X11/GLX host shell; future Wayland/Vulkan backends share the same host ABI. */
int main(int argc, char** argv) {
	if (argc >= 2 && !verify_application(argv[1])) {
		fprintf(stderr, "merkava_invalid:%s\n", argv[1]);
		return 2;
	}
	Display* display = XOpenDisplay(NULL);
	if (!display) {
		fprintf(stderr, "merkava_x11_display_unavailable\n");
		return 3;
	}
	int attributes[] = {GLX_RGBA, GLX_DOUBLEBUFFER, GLX_DEPTH_SIZE, 24, None};
	XVisualInfo* visual = glXChooseVisual(display, DefaultScreen(display), attributes);
	if (!visual) {
		XCloseDisplay(display);
		return 4;
	}
	Colormap colormap = XCreateColormap(display, RootWindow(display, visual->screen), visual->visual, AllocNone);
	XSetWindowAttributes state = {0};
	state.colormap = colormap;
	state.event_mask = ExposureMask | KeyPressMask | StructureNotifyMask;
	Window window = XCreateWindow(display, RootWindow(display, visual->screen), 0, 0,
		960, 640, 0, visual->depth, InputOutput, visual->visual,
		CWColormap | CWEventMask, &state);
	XStoreName(display, window, "Merkava Native Runtime");
	Atom close = XInternAtom(display, "WM_DELETE_WINDOW", False);
	XSetWMProtocols(display, window, &close, 1);
	XMapWindow(display, window);
	GLXContext context = glXCreateContext(display, visual, NULL, True);
	glXMakeCurrent(display, window, context);
	int running = 1;
	while (running) {
		XEvent event;
		XNextEvent(display, &event);
		if (event.type == ClientMessage && (Atom)event.xclient.data.l[0] == close) {
			running = 0;
		}
		if (event.type == KeyPress) {
			running = 0;
		}
	}
	glXMakeCurrent(display, None, NULL);
	glXDestroyContext(display, context);
	XDestroyWindow(display, window);
	XFree(visual);
	XCloseDisplay(display);
	return 0;
}

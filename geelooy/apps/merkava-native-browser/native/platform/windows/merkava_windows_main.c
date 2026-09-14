/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <GL/gl.h>
#include <stdio.h>

#include "../../canonical/merkava_container.h"
#include "../common/merkava_file_loader.h"

/** Verifies canonical application bytes before a Win32 host can present them. */
static int verify_application(const char* path) {
	AwtsFileBytes file;
	if (!awts_read_file_bytes(path, &file)) {
		fprintf(stderr, "merkava_read_failed:%s\n", path);
		return 0;
	}
	AwtsMerkavaContainer container;
	int valid = awts_mkv_open(file.bytes, file.length, &container);
	awts_free_file_bytes(&file);
	return valid;
}

/** Minimal Win32 window procedure; browser semantics remain in Merkava bytecode. */
static LRESULT CALLBACK window_proc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
	(void)wparam;
	(void)lparam;
	if (message == WM_CLOSE) {
		DestroyWindow(window);
		return 0;
	}
	if (message == WM_DESTROY) {
		PostQuitMessage(0);
		return 0;
	}
	return DefWindowProc(window, message, wparam, lparam);
}

/** Creates an OpenGL-capable Win32 host after canonical verification succeeds. */
int main(int argc, char** argv) {
	if (argc >= 2 && !verify_application(argv[1])) {
		fprintf(stderr, "merkava_invalid:%s\n", argv[1]);
		return 2;
	}
	HINSTANCE instance = GetModuleHandle(NULL);
	WNDCLASSA cls = {0};
	cls.lpfnWndProc = window_proc;
	cls.hInstance = instance;
	cls.lpszClassName = "AwtsMerkavaWindow";
	cls.hCursor = LoadCursor(NULL, IDC_ARROW);
	if (!RegisterClassA(&cls)) {
		return 3;
	}
	HWND window = CreateWindowA(cls.lpszClassName, "Merkava Native Runtime",
		WS_OVERLAPPEDWINDOW | WS_VISIBLE, CW_USEDEFAULT, CW_USEDEFAULT,
		960, 640, NULL, NULL, instance, NULL);
	if (!window) {
		return 4;
	}
	HDC device = GetDC(window);
	PIXELFORMATDESCRIPTOR format = {0};
	format.nSize = sizeof(format);
	format.nVersion = 1;
	format.dwFlags = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL | PFD_DOUBLEBUFFER;
	format.iPixelType = PFD_TYPE_RGBA;
	format.cColorBits = 32;
	format.cDepthBits = 24;
	int pixel_format = ChoosePixelFormat(device, &format);
	if (!pixel_format || !SetPixelFormat(device, pixel_format, &format)) {
		return 5;
	}
	HGLRC context = wglCreateContext(device);
	if (!context || !wglMakeCurrent(device, context)) {
		return 6;
	}
	MSG message;
	while (GetMessage(&message, NULL, 0, 0) > 0) {
		TranslateMessage(&message);
		DispatchMessage(&message);
	}
	wglMakeCurrent(NULL, NULL);
	wglDeleteContext(context);
	ReleaseDC(window, device);
	return 0;
}

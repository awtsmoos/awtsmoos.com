/* B"H */
export const source = `// B"H
import "KERNEL32.dll" GetModuleHandleA Sleep ExitProcess;
import "USER32.dll" RegisterClassA CreateWindowExA ShowWindow DefWindowProcA GetDC;
import "GDI32.dll" ChoosePixelFormat SetPixelFormat SwapBuffers;
import "OPENGL32.dll" wglCreateContext wglMakeCurrent glBegin glColor3ub glVertex2i glEnd glFlush;

char* ClassName = "AwtsOpenGLC";
char* Title = "B\\"H - OpenGL C Triangle";

int WndProc(int hWnd, int msg, int wp, int lp) {
    return DefWindowProcA(hWnd, msg, wp, lp);
}

void fillPfd(char* pfd) {
    int i = 0;
    while (i < 64) { pfd[i] = 0; i = i + 1; }
    pfd[0] = 40; // sizeof PIXELFORMATDESCRIPTOR
    pfd[2] = 1;  // version
    pfd[4] = 37; // DRAW_TO_WINDOW | SUPPORT_OPENGL | DOUBLEBUFFER
    pfd[8] = 0;  // RGBA
    pfd[9] = 24; // color bits
    pfd[23] = 24; // depth bits
}

void main() {
    int hInstance = GetModuleHandleA(0);
    int wc[10];
    wc[0] = 3;
    wc[1] = WndProc;
    wc[2] = 0;
    wc[3] = hInstance;
    wc[4] = 0;
    wc[5] = 0;
    wc[6] = 6;
    wc[7] = 0;
    wc[8] = ClassName;
    RegisterClassA(wc);
    int hWnd = CreateWindowExA(0, ClassName, Title, 13565952, 100, 100, 420, 320, 0, 0, hInstance, 0);
    ShowWindow(hWnd, 5);
    int hdc = GetDC(hWnd);
    char pfd[64];
    fillPfd(pfd);
    int pf = ChoosePixelFormat(hdc, pfd);
    SetPixelFormat(hdc, pf, pfd);
    int rc = wglCreateContext(hdc);
    wglMakeCurrent(hdc, rc);

    glBegin(4);
    glColor3ub(255, 80, 80); glVertex2i(-80, -60);
    glColor3ub(80, 255, 120); glVertex2i(80, -60);
    glColor3ub(80, 120, 255); glVertex2i(0, 90);
    glEnd();
    glFlush();
    SwapBuffers(hdc);
    Sleep(1000);
    ExitProcess(0);
}
`;
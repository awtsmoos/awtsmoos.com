/* B"H */
export const source = `// B"H
import "KERNEL32.dll" GetModuleHandleA Sleep ExitProcess;
import "USER32.dll" RegisterClassA CreateWindowExA ShowWindow DefWindowProcA GetDC;
import "GDI32.dll" ChoosePixelFormat SetPixelFormat SwapBuffers;
import "OPENGL32.dll" wglCreateContext wglMakeCurrent glBegin glColor3ub glVertex2i glEnd glFlush;

char* ClassName = "AwtsOpenGLStress";
char* Title = "B\\"H - OpenGL C Stress";

int WndProc(int hWnd, int msg, int wp, int lp) {
    return DefWindowProcA(hWnd, msg, wp, lp);
}

void fillPfd(char* pfd) {
    int i = 0;
    while (i < 64) { pfd[i] = 0; i = i + 1; }
    pfd[0] = 40; pfd[2] = 1; pfd[4] = 37; pfd[8] = 0; pfd[9] = 24; pfd[23] = 24;
}

void main() {
    int hInstance = GetModuleHandleA(0);
    int wc[10];
    wc[0] = 3; wc[1] = WndProc; wc[2] = 0; wc[3] = hInstance; wc[4] = 0;
    wc[5] = 0; wc[6] = 6; wc[7] = 0; wc[8] = ClassName;
    RegisterClassA(wc);
    int hWnd = CreateWindowExA(0, ClassName, Title, 13565952, 100, 100, 520, 420, 0, 0, hInstance, 0);
    ShowWindow(hWnd, 5);
    int hdc = GetDC(hWnd);
    char pfd[64];
    fillPfd(pfd);
    int pf = ChoosePixelFormat(hdc, pfd);
    SetPixelFormat(hdc, pf, pfd);
    int rc = wglCreateContext(hdc);
    wglMakeCurrent(hdc, rc);

    int i = 0;
    while (i < 64) {
        glBegin(4);
        glColor3ub(255, i, 80); glVertex2i(-100 + i, -80);
        glColor3ub(80, 255, i); glVertex2i(100 - i, -80);
        glColor3ub(i, 120, 255); glVertex2i(0, 80 - i);
        glEnd();
        i = i + 1;
    }
    glFlush();
    SwapBuffers(hdc);
    Sleep(1000);
    ExitProcess(0);
}
`;
/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

import "OPENGL32.dll" glBegin glColor3ub glVertex2i glEnd glFlush;

void main() {
    print("B\\"H - OpenGL command stress test\\n");
    int GL_TRIANGLES = 4;
    int i = 0;

    while (i < 64) {
        glBegin(GL_TRIANGLES);
        glColor3ub(255, i, 80);
        glVertex2i(-100 + i, -80);
        glColor3ub(80, 255, i);
        glVertex2i(100 - i, -80);
        glColor3ub(i, 120, 255);
        glVertex2i(0, 80 - i);
        glEnd();
        i = i + 1;
    }

    glFlush();
    print("64 OpenGL triangles emitted.\\n");
    sleep(1000);
    exit(0);
}
`;
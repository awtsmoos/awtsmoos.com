/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

import "OPENGL32.dll" glBegin glColor3ub glVertex2i glEnd glFlush;

void main() {
    print("B\\"H - OpenGL integer triangle stress test\\n");
    print("Imports real OPENGL32.dll symbols, then emits a triangle command stream.\\n");

    int GL_TRIANGLES = 4;
    glBegin(GL_TRIANGLES);
    glColor3ub(255, 80, 80);
    glVertex2i(-80, -60);
    glColor3ub(80, 255, 120);
    glVertex2i(80, -60);
    glColor3ub(80, 120, 255);
    glVertex2i(0, 90);
    glEnd();
    glFlush();

    print("OpenGL command stream completed.\\n");
    sleep(1000);
    exit(0);
}
`;
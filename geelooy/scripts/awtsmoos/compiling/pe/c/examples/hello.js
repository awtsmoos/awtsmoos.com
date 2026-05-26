/* B"H */
export const source = `// B"H
#include <stdio.h>
import "USER32.dll" MessageBoxA;
import "KERNEL32.dll" ExitProcess;

void main() {
    // MessageBoxA(hWnd, Text, Caption, Type)
    MessageBoxA(0, "B\\"H - Hello from Awtsmoos C!", "Awtsmoos", 0);
    ExitProcess(0);
}
`;
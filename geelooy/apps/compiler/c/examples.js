/* B"H */

const STDLIB = `
// --- B"H Standard Library ---
import "KERNEL32.dll" GetStdHandle WriteFile ReadFile ExitProcess;
import "USER32.dll" MessageBoxA;

// File Handles
int STDIN = -10;
int STDOUT = -11;

// Prints a string to StdOut
void print(char* str) {
    int len = 0;
    // Calculate length manually (no strlen)
    char* ptr = str;
    while (*ptr != 0) {
        len = len + 1;
        ptr = ptr + 1;
    }
    
    int written = 0;
    int hStdOut = GetStdHandle(STDOUT);
    WriteFile(hStdOut, str, len, &written, 0);
}

// Reads line from StdIn (Blocking)
// Buffer must be pre-allocated.
int read_line(char* buffer, int maxLen) {
    int hStdIn = GetStdHandle(STDIN);
    int read = 0;
    ReadFile(hStdIn, buffer, maxLen, &read, 0);
    
    // Null terminate logic (replace \r\n)
    if (read > 2) {
        char* end = buffer + read;
        end = end - 2; 
        *end = 0; // Remove \r\n
    }
    return read;
}

void exit(int code) {
    ExitProcess(code);
}
// ----------------------------
`;

export const C_EXAMPLES = {
    hello: `${STDLIB}
void main() {
    MessageBoxA(0, "B\\"H - Hello from C!", "Awtsmoos C", 0);
    exit(0);
}
`,

    console: `${STDLIB}
void main() {
    print("B\\"H - Console Output Test\\n");
    print("--------------------------\\n");
    print("This is printed via WriteFile to StdOut.\\n");
    print("Generative Existence from Nothingness.\\n");
    
    // Simple Loop
    int i = 0;
    while (i < 5) {
        print(". ");
        i = i + 1;
    }
    print("\\nDone.\\n");
    
    exit(0);
}
`,

    echo: `${STDLIB}
// B"H - Echo Server
// Type in the console, and it will echo back.

void main() {
    char buffer[128]; // Allocate stack buffer
    
    print("B\\"H - Echo Chamber. Type something and press Enter:\\n> ");
    
    // Read from Stdin
    read_line(buffer, 128);
    
    print("You said: ");
    print(buffer);
    print("\\n");
    
    exit(0);
}
`
};
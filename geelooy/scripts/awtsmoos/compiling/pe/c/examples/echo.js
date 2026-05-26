/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

void main() {
    char buffer[128];
    
    print("B\\"H - Echo Chamber. Type something and press Enter:\\n> ");
    
    // Read from Stdin
    int hStdIn = GetStdHandle(-10); // STDIN
    int read = 0;
    ReadFile(hStdIn, buffer, 128, &read, 0);
    
    // Null terminate logic
    if (read > 2) {
        char* end = buffer + read;
        end = end - 2; 
        *end = 0; // Remove \\r\\n
    }
    
    print("You said: ");
    print(buffer);
    print("\\nWaiting 5 seconds...\\n");
    sleep(5000);
    exit(0);
}
`;
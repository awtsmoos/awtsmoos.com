/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void main() {
    print("B\\"H - Console Output Test\\n");
    print("--------------------------------------\\n");
    print("Random number: ");
    print_int(rand());
    print("\\n");
    
    // Simple Loop
    int i = 0;
    while (i < 5) {
        print("Count: ");
        print_int(i);
        print("\\n");
        i = i + 1;
    }
    
    print("\\nDone. Waiting 3 seconds...\\n");
    sleep(3000);
    exit(0);
}
`;
/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void main() {
    printf("B\\"H - Console Output Test (via MSVCRT)\\n");
    printf("--------------------------------------\\n");
    printf("This uses standard printf! Random number: %d\\n", rand());
    
    // Simple Loop
    int i = 0;
    while (i < 5) {
        printf("Count: %d\\n", i);
        i = i + 1;
    }
    
    printf("\\nDone. Waiting 3 seconds...\\n");
    sleep(3000);
    exit(0);
}
`;
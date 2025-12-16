/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

int fib(int n) {
    if (n < 2) return n;
    return fib(n-1) + fib(n-2);
}

void main() {
    print("B\\"H - Fibonacci Recursion Test\\n");
    print("Calculating fib(12)...\\n");
    
    int f = fib(12);
    
    print("Result: ");
    print_int(f);
    print("\\n");
    
    // Check known correct value
    if (f == 144) {
        print("Verification: CORRECT (144)\\n");
    } else {
        print("Verification: FAILED\\n");
    }
    
    print("Waiting 5 seconds...\\n");
    sleep(5000);
    exit(0);
}
`;
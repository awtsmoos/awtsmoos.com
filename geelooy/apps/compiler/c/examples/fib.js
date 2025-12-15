/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

// Helper to print integer
void print_int(int n) {
    if (n == 0) {
        print("0");
        return;
    }
    
    char buf[32];
    int i = 30;
    buf[31] = 0;
    
    while (n > 0) {
        int d = n;
        // Modulo hack: n % 10 = n - (n/10)*10
        int div = n / 10;
        int rem = n - (div * 10);
        
        buf[i] = rem + 48; // '0'
        i = i - 1;
        n = div;
    }
    
    char* s = buf + i + 1;
    print(s);
}

int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}

void main() {
    print("B\\"H - Fibonacci Recursion Test\\n");
    print("Calculating fib(12)...\\n");
    
    int f = fib(12);
    
    print("Result: ");
    print_int(f);
    print("\\nWaiting 5 seconds...\\n");
    sleep(5000);
    exit(0);
}
`;
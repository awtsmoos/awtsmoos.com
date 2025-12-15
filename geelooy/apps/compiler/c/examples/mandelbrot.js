/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

void main() {
    print("B\\"H - Mandelbrot Set\\n");
    
    int w = 60;
    int h = 30;
    int y = 0;
    
    // Scaled by 1000
    int minRe = -2000;
    int maxRe = 1000;
    int minIm = -1200;
    int maxIm = 1200;
    
    int reStep = (maxRe - minRe) / w;
    int imStep = (maxIm - minIm) / h;
    
    char line[64];
    line[60] = 10; // Newline
    line[61] = 0;
    
    while (y < h) {
        int cIm = minIm + (y * imStep);
        int x = 0;
        
        while (x < w) {
            int cRe = minRe + (x * reStep);
            
            int Zre = cRe;
            int Zim = cIm;
            int isInside = 1;
            int n = 0;
            
            while (n < 20) {
                // Z^2 + C
                // (a+bi)^2 = a^2 - b^2 + 2abi
                
                int re2 = (Zre * Zre) / 1000;
                int im2 = (Zim * Zim) / 1000;
                
                if ((re2 + im2) > 4000) {
                    isInside = 0;
                    n = 100; // Break
                } else {
                    int twoab = (2 * Zre * Zim) / 1000;
                    Zre = re2 - im2 + cRe;
                    Zim = twoab + cIm;
                    n = n + 1;
                }
            }
            
            char c = 32; // Space
            if (isInside) c = 35; // #
            else c = 46; // .
            
            line[x] = c;
            x = x + 1;
        }
        
        print(line);
        y = y + 1;
    }
    
    print("\\nWaiting 5 seconds...\\n");
    sleep(5000);
    exit(0);
}
`;
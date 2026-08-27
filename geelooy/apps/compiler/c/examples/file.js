/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>

void main() {
    print("B\\"H - File I/O Test\\n");
    print("Opening 'c_output.txt' for writing...\\n");
    
    int f = fopen("c_output.txt", "w");
    
    if (f == -1) {
        print("Failed to open file! Handle is -1.\\n");
        exit(1);
    }
    
    print("File Handle: ");
    print_hex(f);
    print("\\n");
    
    fputs("B\\"H\\r\\n", f);
    fputs("This file was created by the Awtsmoos C Compiler standard library.\\r\\n", f);
    fputs("Existence from Nothingness.\\r\\n", f);
    
    fclose(f);
    
    print("Success. content written.\\n");
    print("Check your download folder or the folder containing this EXE.\\n");
    
    sleep(4000);
    exit(0);
}
`;
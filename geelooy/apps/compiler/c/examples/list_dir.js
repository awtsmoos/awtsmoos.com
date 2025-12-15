/* B"H */

export const source = `
#include <stdio.h>
#include <dirent.h>
#include <unistd.h>

void main() {
    print("B\\"H - Directory Listing via dirent.h\\n");
    print("-----------------------------------\\n");
    
    struct DIR* d;
    struct dirent* dir;
    
    d = opendir(".");
    
    if (d) {
        while ((dir = readdir(d)) != 0) {
            // d_name is a char array in the struct
            // We can print it directly
            // Struct access via pointer ->
            char* name = dir->d_name;
            
            // Filter . and ..
            char c = *name;
            if (c != 46) {
                print(name);
                print("\\n");
            }
        }
        closedir(d);
    } else {
        print("Failed to open directory.\\n");
    }
    
    print("-----------------------------------\\n");
    print("Done. Sleeping...\\n");
    sleep(5000);
    exit(0);
}
`;
/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>
#include <dirent.h>

void main() {
    print("B\\"H - Directory Lister\\n");
    print("Scanning current directory...\\n");

    struct DIR* dir = opendir(".");
    
    if (dir == 0) {
        print("Error: opendir failed. (Handle is -1)\\n");
        sleep(5000);
        exit(1);
    }
    
    int count = 0;
    struct dirent* ent;
    char buf[512];
    
    while (1) {
        ent = readdir(dir);
        if (ent == 0) break;
        
        char* name = ent->d_name;
        
        // name[0] != '.' (46)
        if (name[0] != 46) {
             sprintf(buf, "[File] %s\\n", name);
             print(buf);
             count++;
        }
    }
    
    closedir(dir);
    
    print("Total Files: ");
    print_int(count);
    print("\\nDone. Waiting 10 seconds before close...\\n");
    sleep(10000);
    exit(0);
}
`;
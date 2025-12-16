/* B"H */
export const source = `// B"H
#include <stdio.h>
#include <unistd.h>
#include <dirent.h>

void main() {
    printf("B\\"H - Directory Lister\\n");
    printf("Scanning current directory...\\n");
    fflush(0);

    struct DIR* dir = opendir(".");
    
    if (dir == 0) {
        printf("Error: opendir failed. (Handle is -1)\\n");
        fflush(0);
        sleep(5000);
        exit(1);
    }
    
    int count = 0;
    struct dirent* ent;
    
    while (1) {
        ent = readdir(dir);
        if (ent == 0) break;
        
        char* name = ent->d_name;
        
        // name[0] != '.' (46)
        if (name[0] != 46) {
             printf("[File] %s\\n", name);
             fflush(0); 
             count++;
        }
    }
    
    closedir(dir);
    
    printf("Total: %d\\n", count);
    printf("Done. Waiting 10 seconds before close...\\n");
    fflush(0);
    sleep(10000);
    exit(0);
}
`;
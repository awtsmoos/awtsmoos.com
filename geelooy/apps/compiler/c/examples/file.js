/* B"H */
import { STDLIB } from './stdlib.js';

export const source = `${STDLIB}
import "KERNEL32.dll" CreateFileA CloseHandle;

void main() {
    print("B\\"H - Writing to file 'c_output.txt'...\\n");
    
    char* fname = "c_output.txt";
    // Add UTF-8 BOM (\xEF\xBB\xBF) so editors read it correctly
    char* content = "\\xEF\\xBB\\xBFB\\"H - Content written by Awtsmoos C Compiler.";
    int len = 49; // 3 BOM + 46 chars
    
    // CreateFileA(name, GENERIC_WRITE=0x40000000, 0, 0, CREATE_ALWAYS=2, 0x80, 0)
    int hFile = CreateFileA(fname, 0x40000000, 0, 0, 2, 128, 0);
    
    if (hFile == -1) {
        print("Error creating file.\\n");
        exit(1);
    }
    
    int written = 0;
    WriteFile(hFile, content, len, &written, 0);
    CloseHandle(hFile);
    
    print("Success. Check your downloads/folder.\\n");
    exit(0);
}
`;
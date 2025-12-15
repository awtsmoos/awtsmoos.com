/* B"H */
import { STDLIB } from './stdlib.js';

export const source = `${STDLIB}
void main() {
    char buffer[128];
    
    print("B\\"H - Echo Chamber. Type something and press Enter:\\n> ");
    
    // Read from Stdin
    read_line(buffer, 128);
    
    print("You said: ");
    print(buffer);
    print("\\nWaiting 5 seconds...\\n");
    sleep(5000);
    exit(0);
}
`;
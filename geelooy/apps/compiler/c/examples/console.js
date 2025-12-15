/* B"H */
import { STDLIB } from './stdlib.js';

export const source = `${STDLIB}
void main() {
    print("B\\"H - Console Output Test\\n");
    print("--------------------------\\n");
    print("This is printed via WriteFile to StdOut.\\n");
    print("Generative Existence from Nothingness.\\n");
    
    // Simple Loop
    int i = 0;
    while (i < 5) {
        print(". ");
        i = i + 1;
    }
    print("\\nDone. Waiting 5 seconds...\\n");
    sleep(5000);
    exit(0);
}
`;
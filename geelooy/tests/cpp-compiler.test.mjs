// B"H
import assert from "assert";
import { compileCppToC, compileCppToAsm, compileCppToWindows64 } from "../scripts/awtsmoos/compiling/cpp/compiler.js";

const source = `
namespace awt {
  int doubleIt(int value) { return value * 2; }
}
class BrowserSeed {
public:
  int run(int bytes) { int doubled = bytes + bytes; return doubled; }
};
int main() { int x = 5; return x; }
`;

const result = compileCppToC(source);
assert.equal(result.ast.classes[0].name, "BrowserSeed");
assert.ok(result.cSource.includes("int awt_doubleIt(int value)"));
assert.ok(result.cSource.includes("struct BrowserSeed"));
assert.ok(result.cSource.includes("int BrowserSeed_run(int bytes)"));
const asm = compileCppToAsm("int main() { return 7; }");
assert.ok(asm.asmSource.includes("CALL main"));
const win64 = compileCppToWindows64("import \"kernel32.dll\" ExitProcess; int main() { return 0; }");
assert.ok(win64.executable.size > 512);
console.log(JSON.stringify({ ok: true, cSourceBytes: result.cSource.length, peBytes: win64.executable.size }, null, 2));

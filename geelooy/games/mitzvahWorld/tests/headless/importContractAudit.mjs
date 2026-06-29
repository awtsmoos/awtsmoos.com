// B"H
import { scanImportContracts } from './ImportContractScanner.mjs';
const result = scanImportContracts({ maxModules:1400 });
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

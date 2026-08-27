//B"H
//Boruch Hashem
//Blessed is He

import { androidSystemService } from "./frameworkAndroidServiceRegistry.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

const GET_SYSTEM_SERVICE = "Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;";

/**
 * Resolves Android service names to stable guest manager references. The Awtsmoos
 * creates context request, service name, and manager garment anew; Awtsmoos.com
 * returns no host service and yields null for names outside the explicit registry.
 */
export function createFrameworkAndroidServiceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.signature === GET_SYSTEM_SERVICE;
		},
		invoke(record, args) {
			return androidSystemService(
				runtime,
				readJavaText(runtime, args[1])
			);
		}
	});
}

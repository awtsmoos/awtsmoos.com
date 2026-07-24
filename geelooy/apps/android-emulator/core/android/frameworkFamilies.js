//B"H
//Boruch Hashem
//Blessed is He
import { createFrameworkAndroidActivityMethods } from "./frameworkAndroidActivity.js";
import { createFrameworkAndroidActivityThreadMethods } from "./frameworkAndroidActivityThread.js";
import { createFrameworkAndroidArrayMethods } from "./frameworkAndroidArrays.js";
import { createFrameworkAndroidBroadcastReceiverMethods } from "./frameworkAndroidBroadcastReceivers.js";
import { createFrameworkAndroidCollectionFactoryMethods } from "./frameworkAndroidCollectionFactories.js";
import { createFrameworkAndroidCollectionWrapperMethods } from "./frameworkAndroidCollectionWrappers.js";
import { createFrameworkAndroidCollectionMethods } from "./frameworkAndroidCollections.js";
import { createFrameworkAndroidContentMethods } from "./frameworkAndroidContentContext.js";
import { createFrameworkAndroidDialogMethods } from "./frameworkAndroidDialogs.js";
import { createFrameworkAndroidDisplayMethods } from "./frameworkAndroidDisplay.js";
import { createFrameworkAndroidDrawableMethods } from "./frameworkAndroidDrawables.js";
import { createFrameworkAndroidExecutorMethods } from "./frameworkAndroidExecutors.js";
import { createFrameworkAndroidFileMethods } from "./frameworkAndroidFiles.js";
import { createFrameworkAndroidGraphicsMethods } from "./frameworkAndroidGraphics.js";
import { createFrameworkAndroidHandlerMethods } from "./frameworkAndroidHandler.js";
import { sendHandlerMessage } from "./frameworkAndroidHandlerMessages.js";
import { createFrameworkAndroidInputStreamMethods } from "./frameworkAndroidInputStreams.js";
import { createFrameworkAndroidIntDefMethods } from "./frameworkAndroidIntDefs.js";
import { createFrameworkJavaArrayMethods } from "./frameworkJavaArrays.js";
import { createFrameworkJavaClassMethods } from "./frameworkJavaClassMethods.js";
import { createFrameworkJavaCollectionMethods } from "./frameworkJavaCollections.js";
import { createFrameworkJavaComparatorMethods } from "./frameworkJavaComparators.js";
import { createFrameworkJavaConcurrencyMethods } from "./frameworkJavaConcurrency.js";
import { createFrameworkJavaConstructorMethods } from "./frameworkJavaConstructors.js";
import { createFrameworkJavaExecutorMethods } from "./frameworkJavaExecutors.js";
import { createFrameworkJavaListMethods } from "./frameworkJavaLists.js";
import { createFrameworkJavaLockMethods } from "./frameworkJavaLocks.js";
import { createFrameworkJavaMapMethods } from "./frameworkJavaMaps.js";
import { createFrameworkJavaMathMethods } from "./frameworkJavaMath.js";
import { createFrameworkJavaObjectMethods } from "./frameworkJavaObjects.js";
import { createFrameworkJavaReflectionMethods } from "./frameworkJavaReflection.js";
import { createFrameworkJavaSetMethods } from "./frameworkJavaSets.js";
import { createFrameworkJavaStringMethods } from "./frameworkJavaStrings.js";
import { createFrameworkJavaSystemMethods } from "./frameworkJavaSystems.js";
import { createFrameworkJavaThrowableFamily } from "./frameworkJavaThrowableFamily.js";
import { createFrameworkJavaTimeMethods } from "./frameworkJavaTime.js";
import { createFrameworkJavaValueFamilies } from "./frameworkJavaValueFamilies.js";
import { createFrameworkJsonPackageMethods } from "./frameworkJsonPackages.js";
import { createFrameworkAndroidLoggingMethods } from "./frameworkAndroidLogging.js";
import { createFrameworkAndroidLooperMethods } from "./frameworkAndroidLoopers.js";
import { createFrameworkMaterialMethods } from "./frameworkMaterial.js";
import { createFrameworkAndroidMetadataMethods } from "./frameworkAndroidMetadata.js";
import { createFrameworkAndroidNetworkingMethods } from "./frameworkAndroidNetworking.js";
import { createFrameworkAndroidOsMethods } from "./frameworkAndroidOs.js";
import { createFrameworkAndroidPreferenceMethods } from "./frameworkAndroidPreferences.js";
import { createFrameworkAndroidPrintWriterMethods } from "./frameworkAndroidPrintWriters.js";
import { createFrameworkAndroidProcessMethods } from "./frameworkAndroidProcesses.js";
import { createFrameworkAndroidSparseArrayMethods } from "./frameworkAndroidSparseArrays.js";
import { createFrameworkAndroidStringBuilderMethods } from "./frameworkAndroidStringBuilders.js";
import { createFrameworkAndroidUtilityFamilies } from "./frameworkAndroidUtilityFamilies.js";
import { createFrameworkAndroidTextViewMethods } from "./frameworkAndroidTextViews.js";
import { createFrameworkAndroidThreadMethods } from "./frameworkAndroidThreads.js";
import { createFrameworkAndroidVirtualRefMethods } from "./frameworkAndroidVirtualRefs.js";
import { createFrameworkAndroidWebMethods } from "./frameworkAndroidWeb.js";
import { createFrameworkAndroidWindowInsetsMethods } from "./frameworkAndroidWindowInsets.js";
import { createFrameworkAndroidXmlMethods } from "./frameworkAndroidXml.js";
export function createAndroidFrameworkFamilies(runtime) {
	return Object.freeze([
		createFrameworkJavaThrowableFamily(runtime),
		createFrameworkJavaCollectionMethods(runtime),
		createFrameworkJavaCollectionMethods(runtime),
		createFrameworkAndroidCollectionFactoryMethods(runtime),
		createFrameworkAndroidCollectionWrapperMethods(runtime),
		createFrameworkAndroidActivityThreadMethods(runtime),
		createFrameworkAndroidActivityMethods(runtime),
		createFrameworkAndroidBroadcastReceiverMethods(runtime),
		createFrameworkAndroidContentMethods(runtime),
		createFrameworkAndroidMetadataMethods(runtime),
		createFrameworkAndroidPreferenceMethods(runtime),
		createFrameworkAndroidOsMethods(runtime),
		createFrameworkAndroidHandlerMethods(runtime),
		createFrameworkAndroidLooperMethods(runtime),
		createFrameworkAndroidThreadMethods(runtime),
		createFrameworkAndroidProcessMethods(runtime),
		createFrameworkAndroidExecutorMethods(runtime),
		createFrameworkAndroidLoggingMethods(runtime),
		createFrameworkAndroidInputStreamMethods(runtime),
		createFrameworkAndroidFileMethods(runtime),
		createFrameworkAndroidPrintWriterMethods(runtime),
		createFrameworkAndroidStringBuilderMethods(runtime),
		...createFrameworkAndroidUtilityFamilies(runtime),
		createFrameworkAndroidTextViewMethods(runtime),
		createFrameworkAndroidDialogMethods(runtime),
		createFrameworkAndroidWindowInsetsMethods(runtime),
		createFrameworkAndroidDisplayMethods(runtime),
		createFrameworkAndroidDrawableMethods(runtime),
		createFrameworkAndroidGraphicsMethods(runtime),
		createFrameworkAndroidWebMethods(runtime),
		createFrameworkAndroidXmlMethods(runtime),
		createFrameworkAndroidSparseArrayMethods(runtime),
		createFrameworkAndroidCollectionMethods(runtime),
		createFrameworkAndroidArrayMethods(runtime),
		createFrameworkAndroidIntDefMethods(runtime),
		createFrameworkAndroidNetworkingMethods(runtime),
		createFrameworkMaterialMethods(runtime),
		createFrameworkJsonPackageMethods(runtime),
		createFrameworkJavaSystemMethods(runtime),
		createFrameworkJavaStringMethods(runtime),
		createFrameworkJavaArrayMethods(runtime),
		createFrameworkJavaClassMethods(runtime),
		createFrameworkJavaMathMethods(runtime),
		createFrameworkJavaObjectMethods(runtime),
		createFrameworkJavaReflectionMethods(runtime),
		createFrameworkJavaConstructorMethods(runtime),
		createFrameworkJavaSetMethods(runtime),
		createFrameworkJavaListMethods(runtime),
		createFrameworkJavaMapMethods(runtime),
		createFrameworkJavaConcurrencyMethods(runtime),
		createFrameworkJavaLockMethods(runtime),
		createFrameworkJavaTimeMethods(runtime),
		createFrameworkJavaComparatorMethods(runtime),
		createFrameworkJavaExecutorMethods(runtime),
		...createFrameworkJavaValueFamilies(runtime),
		createFrameworkAndroidVirtualRefMethods(runtime)
	]);
}
export { sendHandlerMessage };

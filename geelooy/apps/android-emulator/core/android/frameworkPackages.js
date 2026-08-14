//B"H //Boruch Hashem //Blessed is He

import { createApplicationContext } from "./applicationObjects.js";
import { createGuestString, readGuestText } from "./guestText.js";
import { systemClassLoader } from "./frameworkJavaClassRuntime.js";
import { createInstalledPackageContext } from "./frameworkPackageContexts.js";
import {
	APPLICATION_INFO,
	installedApplicationInfo,
	installedApplicationLabel,
	installedPackageInfo,
	installedPackageName,
	PACKAGE_INFO
} from "./frameworkPackageObjects.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const SIGNATURES = Object.freeze({
	applicationContext: "Landroid/content/Context;->getApplicationContext()Landroid/content/Context;",
	applicationInfo: `Landroid/content/Context;->getApplicationInfo()${APPLICATION_INFO}`,
	applicationInfoByName: `${PACKAGE_MANAGER}->getApplicationInfo(Ljava/lang/String;I)${APPLICATION_INFO}`,
	applicationLabel: `${PACKAGE_MANAGER}->getApplicationLabel(${APPLICATION_INFO})Ljava/lang/CharSequence;`,
	classLoader: "Landroid/content/Context;->getClassLoader()Ljava/lang/ClassLoader;",
	createPackageContext: "Landroid/content/Context;->createPackageContext(Ljava/lang/String;I)Landroid/content/Context;",
	getPackageManager: `Landroid/content/Context;->getPackageManager()${PACKAGE_MANAGER}`,
	getPackageName: "Landroid/content/Context;->getPackageName()Ljava/lang/String;",
	installer: `${PACKAGE_MANAGER}->getInstallerPackageName(Ljava/lang/String;)Ljava/lang/String;`,
	instantApp: `${PACKAGE_MANAGER}->isInstantApp()Z`,
	loadLabel: `${APPLICATION_INFO}->loadLabel(${PACKAGE_MANAGER})Ljava/lang/CharSequence;`,
	packageInfo: `${PACKAGE_MANAGER}->getPackageInfo(Ljava/lang/String;I)${PACKAGE_INFO}`,
	systemFeature: `${PACKAGE_MANAGER}->hasSystemFeature(Ljava/lang/String;)Z`
});

/**
 * Reveals package identity, process Application, and one guest class loader.
 * The Awtsmoos renews Context and loader in one measured process vessel;
 * Awtsmoos.com keeps host modules outside while guest identity remains stable.
 */
export function createFrameworkPackageMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		invoke(record, args) {
			const signature = record.signature;
			if (signature === SIGNATURES.classLoader) return systemClassLoader(runtime);
			if (signature === SIGNATURES.getPackageManager) return packageManager(runtime);
			if (signature === SIGNATURES.getPackageName) return guestPackageName(runtime);
			if (signature === SIGNATURES.applicationContext) {
				return createApplicationContext(runtime);
			}
			if (signature === SIGNATURES.createPackageContext) {
				return createInstalledPackageContext(runtime, args[0], args[1], args[2]);
			}
			if (signature === SIGNATURES.applicationInfo) {
				return installedApplicationInfo(runtime);
			}
			if (signature === SIGNATURES.applicationInfoByName) {
				requireInstalledPackage(runtime, args[1]);
				return installedApplicationInfo(runtime);
			}
			if (signature === SIGNATURES.packageInfo) {
				requireInstalledPackage(runtime, args[1]);
				return installedPackageInfo(runtime);
			}
			if ([SIGNATURES.applicationLabel, SIGNATURES.loadLabel].includes(signature)) {
				return createGuestString(runtime, installedApplicationLabel(runtime));
			}
			if ([SIGNATURES.systemFeature, SIGNATURES.instantApp].includes(signature)) return 0;
			if (signature === SIGNATURES.installer) return 0;
			throw packageError("ANDROID_PACKAGE_METHOD_UNSUPPORTED", signature);
		}
	});
}

function packageManager(runtime) {
	if (!runtime.packageManager) {
		runtime.packageManager = runtime.heap.allocate(PACKAGE_MANAGER);
	}
	return runtime.packageManager;
}

function guestPackageName(runtime) {
	return createGuestString(runtime, installedPackageName(runtime));
}

function requireInstalledPackage(runtime, value) {
	const requested = readGuestText(runtime, value);
	if (requested !== installedPackageName(runtime)) {
		throw packageError("ANDROID_PACKAGE_NOT_FOUND", requested);
	}
}

function packageError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

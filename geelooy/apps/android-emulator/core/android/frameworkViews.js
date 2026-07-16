//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import { createWebViewDescriptor } from "./webViewState.js";

/**
 * Handles Activity, View, ViewGroup, widgets, and bounded WebView methods. The
 * Awtsmoos creates text, hierarchy, listener, content root, and packaged browser
 * doorway anew; Awtsmoos.com preserves every call as measured guest testimony.
 */
export function createFrameworkViewMethods(runtime) {
	const handlers = new Map([
		["Landroid/app/Activity;->setContentView(Landroid/view/View;)V", setContentView],
		["Landroid/view/View;->setMinimumHeight(I)V", setMinimumHeight],
		["Landroid/view/View;->setOnClickListener(Landroid/view/View$OnClickListener;)V", setListener],
		["Landroid/view/ViewGroup;->addView(Landroid/view/View;)V", addView],
		["Landroid/widget/ScrollView;->addView(Landroid/view/View;)V", addView],
		["Landroid/widget/LinearLayout;->setOrientation(I)V", setOrientation],
		["Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V", setText],
		["Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V", loadUrl]
	]);
	return Object.freeze({
		canHandle(record) {
			return handlers.has(record.signature);
		},
		invoke(record, args) {
			return handlers.get(record.signature)(args, runtime);
		}
	});
}

function setContentView(args, runtime) {
	runtime.contentView = args[1] || null;
	runtime.heap.setField(args[0], "android:contentView", runtime.contentView);
	runtime.logcat.info("Activity", "setContentView");
}

function setMinimumHeight(args, runtime) {
	runtime.views.set(args[0], "minimumHeight", Number(args[1] || 0));
}

function setListener(args, runtime) {
	runtime.views.set(args[0], "clickListener", args[1] || null);
}

function addView(args, runtime) {
	if (args[0] && args[1]) runtime.views.addChild(args[0], args[1]);
}

function setOrientation(args, runtime) {
	runtime.views.set(args[0], "orientation", Number(args[1] || 0));
}

function setText(args, runtime) {
	const text = readGuestText(runtime, args[1]);
	runtime.views.set(args[0], "text", text);
	runtime.heap.setField(args[0], "android:text", text);
	runtime.graphics.canvas({ kind: "text", text });
}

function loadUrl(args, runtime) {
	const url = readGuestText(runtime, args[1]);
	const descriptor = createWebViewDescriptor(runtime, url);
	runtime.views.set(args[0], "web", descriptor);
	runtime.heap.setField(args[0], "android:web:url", url);
	runtime.logcat.info("WebView", `loadUrl ${descriptor.assetPath}`);
}

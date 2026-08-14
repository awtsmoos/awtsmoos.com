//B"H //Boruch Hashem //Blessed is He

import { readGuestText } from "./guestText.js";
import { createWebViewDescriptor } from "./webViewState.js";

/**
 * Handles Activity, View, ViewGroup, widgets, and bounded WebView methods. The
 * Awtsmoos creates context, text, hierarchy, listeners, focus flags, alpha,
 * content root, and packaged browser doorway; Awtsmoos.com preserves testimony.
 */
export function createFrameworkViewMethods(runtime) {
	const handlers = new Map([
		["Landroid/app/Activity;->setContentView(Landroid/view/View;)V", setContentView],
		["Landroid/view/View;->getContext()Landroid/content/Context;", getContext],
		["Landroid/view/View;->setAlpha(F)V", setAlpha],
		["Landroid/view/View;->setFocusable(Z)V", setFocusable],
		["Landroid/view/View;->setFocusableInTouchMode(Z)V", setFocusableInTouchMode],
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

function getContext(args, runtime) {
	runtime.heap.get(args[0]);
	return runtime.heap.getField(args[0], "android:context") || 0;
}

function setContentView(args, runtime) {
	runtime.contentView = args[1] || null;
	runtime.heap.setField(args[0], "android:contentView", runtime.contentView);
	runtime.logcat.info("Activity", "setContentView");
}

function setAlpha(args, runtime) {
	runtime.views.set(args[0], "alpha", Number(args[1]));
	return 0;
}

function setFocusable(args, runtime) {
	return setBooleanProperty(args, runtime, "focusable");
}

function setFocusableInTouchMode(args, runtime) {
	return setBooleanProperty(args, runtime, "focusableInTouchMode");
}

function setBooleanProperty(args, runtime, key) {
	runtime.views.set(args[0], key, args[1] ? 1 : 0);
	return 0;
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

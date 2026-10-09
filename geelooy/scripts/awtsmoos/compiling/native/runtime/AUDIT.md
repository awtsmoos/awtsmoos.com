B"H

# Emulator ↔ Compiler Audit — 2026-10-09

Total emulated API classes: 186

Source: `geelooy/apps/android-emulator/core/android/` (*.js framework shims)

Reference compiler: `geelooy/scripts/awtsmoos/compiling/native/c/` (portable C v3)


## Status legend

- ✅ COMPILABLE-TODAY — pure scalar logic; C implementation possible now
- 🔧 BLOCKED-ON-COMPILER — needs structs / arrays / strings / pointer arithmetic
- 🔌 NEEDS-HOST-BINDING — inherently host-dependent; needs Awtsmoos-owned NDK ABI

### 🔌 NEEDS-HOST-BINDING `Landroid/app/Activity;`
Emulated in: frameworkConstructors.js, frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/ActivityManager;`
Emulated in: frameworkAndroidActivityManager.js, frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/Application;`
Emulated in: applicationObjects.js, frameworkApplications.js, frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/Fragment;`
Emulated in: frameworkAndroidFragmentRoads.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/FragmentManager;`
Emulated in: frameworkAndroidFragmentRoads.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/FragmentTransaction;`
Emulated in: frameworkAndroidFragmentRoads.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/Service;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/app/UiModeManager;`
Emulated in: frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/BroadcastReceiver;`
Emulated in: frameworkConstructors.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/ClipboardManager;`
Emulated in: frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/ComponentCallbacks;`
Emulated in: frameworkApplications.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/ComponentName;`
Emulated in: frameworkComponentObjects.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/ContentProvider;`
Emulated in: frameworkContentProviders.js, providerMethods.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/ContentResolver;`
Emulated in: frameworkAndroidSettings.js, frameworkContentResolverState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/Context;`
Emulated in: applicationObjects.js, frameworkAndroidDateFormats.js, frameworkAndroidDirectories.js, frameworkAndroidResourceAccess.js (+4 more)
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/ContextWrapper;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/Intent;`
Emulated in: frameworkIntentStorage.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/SharedPreferences;`
Emulated in: frameworkPreferences.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/ActivityInfo;`
Emulated in: frameworkPackageObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/ApplicationInfo;`
Emulated in: frameworkPackageObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/ComponentInfo;`
Emulated in: frameworkServiceInfo.js, providerObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/PackageInfo;`
Emulated in: frameworkPackageObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/PackageItemInfo;`
Emulated in: frameworkServiceInfo.js, providerObjects.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/pm/PackageManager;`
Emulated in: frameworkComponentPackageQueries.js, frameworkPackages.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/ProviderInfo;`
Emulated in: providerObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/pm/ServiceInfo;`
Emulated in: frameworkServiceInfo.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/res/AssetManager;`
Emulated in: frameworkAndroidResourceState.js, frameworkAssets.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/res/ColorStateList;`
Emulated in: frameworkAndroidResourceLookup.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/res/Configuration;`
Emulated in: frameworkAndroidResourceState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/content/res/Resources;`
Emulated in: frameworkAndroidResourceState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/content/res/TypedArray;`
Emulated in: frameworkAndroidResourceState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/database/ContentObserver;`
Emulated in: frameworkContentObservers.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/Bitmap;`
Emulated in: frameworkAndroidBitmapTypes.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/Matrix;`
Emulated in: frameworkAndroidMatrixState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/Paint;`
Emulated in: frameworkAndroidPaints.js, frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/Point;`
Emulated in: frameworkAndroidPointValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/Rect;`
Emulated in: frameworkAndroidDisplayObjects.js, frameworkAndroidMediaImageConstruction.js, frameworkAndroidRectValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/RectF;`
Emulated in: frameworkAndroidMatrixMapping.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/graphics/drawable/Drawable;`
Emulated in: frameworkAndroidResourceLookup.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/hardware/HardwareBuffer;`
Emulated in: frameworkAndroidMediaTypes.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/hardware/display/DisplayManager;`
Emulated in: frameworkAndroidDisplays.js, frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/hardware/display/VirtualDisplay;`
Emulated in: frameworkAndroidDisplayObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/media/Image;`
Emulated in: frameworkAndroidMediaTypes.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/media/ImageReader;`
Emulated in: frameworkAndroidMediaTypes.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/net/ConnectivityManager;`
Emulated in: frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/net/Uri;`
Emulated in: frameworkContentResolverState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/os/BaseBundle;`
Emulated in: frameworkBundles.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Landroid/os/Build;`
Emulated in: frameworkAndroidBuildFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/os/Bundle;`
Emulated in: activityLifecycle.js, frameworkAndroidMessages.js, frameworkBundles.js, frameworkIntentStorage.js (+2 more)
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/os/Handler;`
Emulated in: frameworkAndroidLoopState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/os/Looper;`
Emulated in: frameworkAndroidHandlerMethods.js, frameworkAndroidLoopState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/os/Message;`
Emulated in: frameworkAndroidLoopState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/os/PowerManager;`
Emulated in: frameworkAndroidServiceRegistry.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Landroid/os/SystemClock;`
Emulated in: frameworkAndroidSystemClock.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Landroid/os/Trace;`
Emulated in: frameworkAndroidTrace.js, frameworkAndroidTraceFields.js, frameworkAndroidTraceMethods.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/text/SpannableStringBuilder;`
Emulated in: frameworkJavaTextTypes.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/text/TextPaint;`
Emulated in: frameworkAndroidPaints.js, frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/text/format/DateFormat;`
Emulated in: frameworkAndroidDateFormats.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/util/DisplayMetrics;`
Emulated in: frameworkAndroidResourceState.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Landroid/util/Log;`
Emulated in: frameworkAndroidLog.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/util/LongArray;`
Emulated in: frameworkAndroidAccessibilityMetadata.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/util/LongSparseArray;`
Emulated in: frameworkAndroidLongSparseArrays.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/util/SparseArray;`
Emulated in: frameworkAndroidSparseArrays.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/util/TypedValue;`
Emulated in: frameworkAndroidResourceState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/Choreographer;`
Emulated in: frameworkAndroidChoreographer.js, frameworkAndroidChoreographerState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/ContextThemeWrapper;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/Display;`
Emulated in: frameworkAndroidDisplays.js, frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/Surface;`
Emulated in: surfaceHolderState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/SurfaceHolder;`
Emulated in: surfaceHolderState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/SurfaceView;`
Emulated in: surfaceHolderState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/View;`
Emulated in: frameworkAndroidWindowIdentity.js, frameworkHost.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/ViewConfiguration;`
Emulated in: frameworkAndroidViewConfigurationState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/ViewTreeObserver;`
Emulated in: frameworkAndroidViewTreeObserverState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/Window;`
Emulated in: frameworkAndroidWindowIdentity.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/WindowInsets;`
Emulated in: frameworkAndroidWindowInsetsState.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/WindowManager;`
Emulated in: frameworkAndroidDisplays.js, frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/WindowMetrics;`
Emulated in: frameworkAndroidDisplayObjects.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/accessibility/AccessibilityManager;`
Emulated in: frameworkAndroidAccessibilityManager.js, frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/accessibility/AccessibilityNodeInfo;`
Emulated in: frameworkAndroidAccessibilityMetadata.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Landroid/view/accessibility/AccessibilityRecord;`
Emulated in: frameworkAndroidAccessibilityMetadata.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/view/inputmethod/InputMethodManager;`
Emulated in: frameworkAndroidInputMethods.js, frameworkAndroidServiceRegistry.js
C implementation: *missing*

### 🔌 NEEDS-HOST-BINDING `Landroid/webkit/WebSettings;`
Emulated in: frameworkWebGles.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/io/File;`
Emulated in: frameworkJavaFileFields.js, frameworkJavaFileState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/io/InputStream;`
Emulated in: frameworkAssets.js, frameworkNetwork.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/io/ObjectStreamField;`
Emulated in: frameworkJavaObjectStreamFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/io/Serializable;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaClassHierarchy.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Boolean;`
Emulated in: frameworkJavaBooleanValues.js, frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Byte;`
Emulated in: frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/CharSequence;`
Emulated in: frameworkAndroidResourceValues.js, frameworkHost.js, frameworkJavaBootHierarchy.js, frameworkJavaStrings.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Character;`
Emulated in: frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Class;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaClassValues.js, frameworkJavaClasses.js, frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ClassLoader;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaClassRuntime.js, frameworkJavaClasses.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Cloneable;`
Emulated in: frameworkJavaClassHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Comparable;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Double;`
Emulated in: frameworkJavaDoubleValues.js, frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Enum;`
Emulated in: frameworkJavaEnums.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Exception;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Float;`
Emulated in: frameworkJavaFloatValues.js, frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/IllegalStateException;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Integer;`
Emulated in: frameworkJavaClassValues.js, frameworkJavaIntegerValues.js, frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Iterable;`
Emulated in: frameworkJavaCollectionTypeChecks.js, frameworkJavaSets.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Long;`
Emulated in: frameworkJavaClassValues.js, frameworkJavaLongValues.js, frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Number;`
Emulated in: frameworkJavaNumbers.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Object;`
Emulated in: frameworkAndroidHandlerMethods.js, frameworkAndroidHandlerQueue.js, frameworkAndroidLoopState.js, frameworkAndroidMessages.js (+4 more)
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Package;`
Emulated in: frameworkJavaClassRuntime.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Runnable;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaThreadLifecycle.js, frameworkJavaThreads.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Runtime;`
Emulated in: frameworkJavaRuntime.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/RuntimeException;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaRuntimeExceptions.js
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/lang/Short;`
Emulated in: frameworkJavaPrimitiveTypeFields.js, frameworkJavaShortValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/String;`
Emulated in: frameworkAndroidActivityManager.js, frameworkAndroidBuildFields.js, frameworkAssets.js, frameworkFlutterNativeArrayElements.js (+18 more)
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/StringBuffer;`
Emulated in: frameworkJavaTextTypes.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/StringBuilder;`
Emulated in: frameworkJavaTextTypes.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/System;`
Emulated in: frameworkJavaSystem.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Thread;`
Emulated in: frameworkJavaThreadState.js, frameworkJavaThreads.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ThreadGroup;`
Emulated in: frameworkJavaThreadProperties.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ThreadLocal;`
Emulated in: frameworkJavaThreadLocals.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Throwable;`
Emulated in: frameworkAndroidLog.js, frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/Void;`
Emulated in: frameworkJavaPrimitiveTypeFields.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ref/PhantomReference;`
Emulated in: frameworkJavaReferences.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ref/Reference;`
Emulated in: frameworkJavaReferences.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ref/ReferenceQueue;`
Emulated in: frameworkJavaReferences.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ref/SoftReference;`
Emulated in: frameworkJavaReferences.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/ref/WeakReference;`
Emulated in: frameworkJavaReferences.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/reflect/AccessibleObject;`
Emulated in: frameworkJavaReflectConstructors.js, frameworkJavaReflectFields.js, frameworkJavaReflectMethods.js, frameworkJavaReflectionFamilies.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/reflect/Constructor;`
Emulated in: frameworkJavaReflectConstructorValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/reflect/Field;`
Emulated in: frameworkJavaReflectFieldValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/lang/reflect/Method;`
Emulated in: frameworkJavaReflectMethodValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/math/BigInteger;`
Emulated in: frameworkJavaBigIntegerValues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/net/URI;`
Emulated in: frameworkJavaFileQueries.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/nio/Buffer;`
Emulated in: frameworkJavaByteBuffers.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/nio/ByteBuffer;`
Emulated in: frameworkJavaByteBufferBulk.js, frameworkJavaByteBufferStorage.js, frameworkJavaByteBuffers.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/nio/ByteOrder;`
Emulated in: frameworkJavaByteOrders.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/nio/charset/Charset;`
Emulated in: frameworkJavaCharsets.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/nio/file/Path;`
Emulated in: frameworkJavaFileQueries.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/AbstractCollection;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaSets.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/AbstractMap;`
Emulated in: frameworkJavaAbstractMapConstructors.js, frameworkJavaMaps.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/ArrayDeque;`
Emulated in: frameworkJavaConcurrentQueues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/ArrayList;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaCollectionFactories.js, frameworkJavaExecutorTasks.js, frameworkJavaLists.js (+1 more)
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/util/Arrays;`
Emulated in: frameworkJavaArrays.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Collection;`
Emulated in: frameworkJavaArrayDequeStorage.js, frameworkJavaBootHierarchy.js, frameworkJavaCollectionTypeChecks.js, frameworkJavaConcurrentLinkedQueue.js (+6 more)
C implementation: *missing*

### ✅ COMPILABLE-TODAY `Ljava/util/Collections;`
Emulated in: frameworkJavaCollections.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Comparator;`
Emulated in: frameworkJavaCollectionFactories.js, frameworkJavaPriorityQueues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Enumeration;`
Emulated in: frameworkJavaClassLoader.js, frameworkJavaCollectionFactories.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/HashMap;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaCollectionFactories.js, frameworkJavaMaps.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/HashSet;`
Emulated in: frameworkBundleStorage.js, frameworkJavaBootHierarchy.js, frameworkJavaCollectionFactories.js, frameworkJavaSets.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Iterator;`
Emulated in: frameworkJavaIterators.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/LinkedHashMap;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaMaps.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/LinkedHashSet;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaSets.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/LinkedList;`
Emulated in: frameworkJavaLists.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/List;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaCollectionTypeChecks.js, frameworkJavaLists.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Locale;`
Emulated in: frameworkAndroidResourceState.js, frameworkJavaLocaleStorage.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Map;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaMaps.js, frameworkJsonObjectOperations.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/PriorityQueue;`
Emulated in: frameworkJavaPriorityQueueSources.js, frameworkJavaPriorityQueues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/Set;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaCollectionTypeChecks.js, frameworkJavaSets.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/SortedMap;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/SortedSet;`
Emulated in: frameworkJavaPriorityQueues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/WeakHashMap;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaMaps.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/AbstractExecutorService;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/Callable;`
Emulated in: frameworkJavaThreads.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/ConcurrentLinkedQueue;`
Emulated in: frameworkJavaConcurrentQueues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/CopyOnWriteArrayList;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaCopyOnWrite.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/CopyOnWriteArraySet;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaCopyOnWrite.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/Executor;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/ExecutorService;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/Executors;`
Emulated in: frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/Future;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaFutures.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/FutureTask;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaFutureState.js, frameworkJavaFutures.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/LinkedBlockingQueue;`
Emulated in: frameworkJavaConcurrentQueues.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/RunnableFuture;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/ScheduledExecutorService;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/ScheduledThreadPoolExecutor;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaExecutorTypes.js, frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/ThreadFactory;`
Emulated in: frameworkJavaThreads.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/ThreadPoolExecutor;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaExecutorTypes.js, frameworkJavaExecutors.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/atomic/AtomicBoolean;`
Emulated in: frameworkAtomicBoolean.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/atomic/AtomicInteger;`
Emulated in: frameworkAtomicInteger.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/atomic/AtomicLong;`
Emulated in: frameworkAtomicLong.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/atomic/AtomicReference;`
Emulated in: frameworkAtomicReference.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/atomic/AtomicReferenceFieldUpdater;`
Emulated in: frameworkAtomicReferenceFieldUpdaterMetadata.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/locks/Lock;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaLocks.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/locks/LockSupport;`
Emulated in: frameworkJavaLocks.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/locks/ReadWriteLock;`
Emulated in: frameworkJavaBootHierarchy.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/locks/ReentrantLock;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaLocks.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/concurrent/locks/ReentrantReadWriteLock;`
Emulated in: frameworkJavaBootHierarchy.js, frameworkJavaLocks.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/regex/Matcher;`
Emulated in: frameworkJavaRegexMatcherState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/regex/Pattern;`
Emulated in: frameworkJavaRegexPatternState.js
C implementation: *missing*

### 🔧 BLOCKED-ON-COMPILER `Ljava/util/stream/IntStream;`
Emulated in: frameworkJavaStringQueries.js
C implementation: *missing*

/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include <gtk/gtk.h>
#include <webkit2/webkit2.h>
#include <limits.h>
#include <stdio.h>
#include <string.h>
#include "../common/merkava_source_materializer.h"

/** Owns the package path handed to the GTK activation callback. */
typedef struct MerkavaLaunch {
	const char* packagePath;
} MerkavaLaunch;

/** Opens exact packaged source through mature WebKitGTK DOM/CSS/font semantics. */
static void activate(GtkApplication* application, gpointer userData) {
	MerkavaLaunch* launch = (MerkavaLaunch*)userData;
	char root[PATH_MAX];
	char entry[PATH_MAX];
	if (!awts_materialize_merkava_source(
		launch->packagePath,
		root,
		sizeof(root),
		entry,
		sizeof(entry)
	)) {
		fprintf(stderr, "merkava_source_materialize_failed\n");
		return;
	}
	GtkWidget* window = gtk_application_window_new(application);
	gtk_window_set_title(GTK_WINDOW(window), "Merkava — WebKit compatibility");
	gtk_window_set_default_size(GTK_WINDOW(window), 1100, 760);
	GtkWidget* webView = webkit_web_view_new();
	char* entryUri = g_filename_to_uri(entry, NULL, NULL);
	char* rootUri = g_filename_to_uri(root, NULL, NULL);
	webkit_web_view_load_alternate_html(
		WEBKIT_WEB_VIEW(webView),
		"<p>Loading Merkava source…</p>",
		entryUri,
		rootUri
	);
	webkit_web_view_load_uri(WEBKIT_WEB_VIEW(webView), entryUri);
	gtk_container_add(GTK_CONTAINER(window), webView);
	gtk_widget_show_all(window);
	g_free(entryUri);
	g_free(rootUri);
}

/** Supports a non-GUI materialization probe for CI. */
static int probe(const char* packagePath) {
	char root[PATH_MAX];
	char entry[PATH_MAX];
	if (!awts_materialize_merkava_source(
		packagePath,
		root,
		sizeof(root),
		entry,
		sizeof(entry)
	)) return 3;
	printf("compat_ok entry=%s\n", entry);
	return 0;
}

/** Linux compatibility entrypoint backed by WebKitGTK. */
int main(int argc, char** argv) {
	if (argc >= 3 && strcmp(argv[1], "--compat-probe") == 0) return probe(argv[2]);
	if (argc < 2) {
		fprintf(stderr, "usage: merkava app.merkava\n");
		return 2;
	}
	GtkApplication* application = gtk_application_new(
		"com.awtsmoos.merkava",
		G_APPLICATION_DEFAULT_FLAGS
	);
	MerkavaLaunch launch = { argv[1] };
	g_signal_connect(application, "activate", G_CALLBACK(activate), &launch);
	int status = g_application_run(G_APPLICATION(application), 1, argv);
	g_object_unref(application);
	return status;
}

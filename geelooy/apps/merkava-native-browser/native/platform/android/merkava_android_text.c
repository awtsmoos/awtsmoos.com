/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_text.h"
#include "merkava_font8x8.h"

#include <stdlib.h>
#include <string.h>

static const char* VERT_SRC =
	"#version 300 es\n"
	"layout(location = 0) in vec2 aPos;\n"
	"layout(location = 1) in vec2 aUV;\n"
	"uniform vec2 uResolution;\n"
	"out vec2 vUV;\n"
	"void main() {\n"
	"  vec2 ndc = vec2((aPos.x / uResolution.x) * 2.0 - 1.0,\n"
	"                   1.0 - (aPos.y / uResolution.y) * 2.0);\n"
	"  gl_Position = vec4(ndc, 0.0, 1.0);\n"
	"  vUV = aUV;\n"
	"}\n";

static const char* FRAG_SRC =
	"#version 300 es\n"
	"precision mediump float;\n"
	"in vec2 vUV;\n"
	"uniform sampler2D uAtlas;\n"
	"uniform vec3 uColor;\n"
	"out vec4 oColor;\n"
	"void main() {\n"
	"  float a = texture(uAtlas, vUV).r;\n"
	"  if (a < 0.05) discard;\n"
	"  oColor = vec4(uColor, a);\n"
	"}\n";

static GLuint compile_shader(GLenum type, const char* src) {
	GLuint sh = glCreateShader(type);
	glShaderSource(sh, 1, &src, NULL);
	glCompileShader(sh);
	GLint ok = 0;
	glGetShaderiv(sh, GL_COMPILE_STATUS, &ok);
	if (!ok) { glDeleteShader(sh); return 0; }
	return sh;
}

int awts_text_init(AwtsTextRenderer* tr) {
	if (!tr) return 0;
	memset(tr, 0, sizeof(*tr));

	GLuint vs = compile_shader(GL_VERTEX_SHADER, VERT_SRC);
	GLuint fs = compile_shader(GL_FRAGMENT_SHADER, FRAG_SRC);
	if (!vs || !fs) { glDeleteShader(vs); glDeleteShader(fs); return 0; }
	tr->program = glCreateProgram();
	glAttachShader(tr->program, vs);
	glAttachShader(tr->program, fs);
	glBindAttribLocation(tr->program, 0, "aPos");
	glBindAttribLocation(tr->program, 1, "aUV");
	glLinkProgram(tr->program);
	glDeleteShader(vs);
	glDeleteShader(fs);
	GLint linked = 0;
	glGetProgramiv(tr->program, GL_LINK_STATUS, &linked);
	if (!linked) { glDeleteProgram(tr->program); return 0; }
	tr->uResolution = glGetUniformLocation(tr->program, "uResolution");
	tr->uColor = glGetUniformLocation(tr->program, "uColor");

	/* Font atlas: 16 cols x 6 rows of 8x8 glyphs. */
	uint8_t atlas[48 * 128];
	memset(atlas, 0, sizeof(atlas));
	for (int g = 0; g < AWTS_FONT_COUNT; g++) {
		int col = g % 16, row = g / 16;
		for (int y = 0; y < 8; y++) {
			uint8_t bits = AWTS_FONT8X8[g][y];
			for (int x = 0; x < 8; x++) {
				if (bits & (0x80u >> x))
					atlas[(row * 8 + y) * 128 + col * 8 + x] = 255;
			}
		}
	}
	glGenTextures(1, &tr->texture);
	glBindTexture(GL_TEXTURE_2D, tr->texture);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_R8, 128, 48, 0, GL_RED, GL_UNSIGNED_BYTE, atlas);
	glBindTexture(GL_TEXTURE_2D, 0);

	glGenBuffers(1, &tr->vbo);
	tr->vertCap = 4096 * 6 * 4;
	tr->verts = (float*)malloc(tr->vertCap * sizeof(float));
	if (!tr->verts) { awts_text_shutdown(tr); return 0; }
	tr->ok = 1;
	return 1;
}

void awts_text_shutdown(AwtsTextRenderer* tr) {
	if (!tr) return;
	free(tr->verts);
	tr->verts = NULL;
	if (tr->vbo) glDeleteBuffers(1, &tr->vbo);
	if (tr->texture) glDeleteTextures(1, &tr->texture);
	if (tr->program) glDeleteProgram(tr->program);
	memset(tr, 0, sizeof(*tr));
}

void awts_text_begin(AwtsTextRenderer* tr, int vpW, int vpH) {
	if (!tr || !tr->ok) return;
	tr->vpW = vpW > 0 ? vpW : 1;
	tr->vpH = vpH > 0 ? vpH : 1;
	tr->vertCount = 0;
	tr->curR = tr->curG = tr->curB = -1.0f; /* force color set on first draw */
}

static void flush_quads(AwtsTextRenderer* tr) {
	if (!tr || !tr->ok || tr->vertCount == 0) return;
	glUseProgram(tr->program);
	glUniform2f(tr->uResolution, (float)tr->vpW, (float)tr->vpH);
	glUniform3f(tr->uColor, tr->curR, tr->curG, tr->curB);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, tr->texture);
	glBindBuffer(GL_ARRAY_BUFFER, tr->vbo);
	glBufferData(GL_ARRAY_BUFFER, tr->vertCount * sizeof(float), tr->verts, GL_DYNAMIC_DRAW);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));
	glDrawArrays(GL_TRIANGLES, 0, (GLsizei)(tr->vertCount / 4));
	glDisableVertexAttribArray(0);
	glDisableVertexAttribArray(1);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	tr->vertCount = 0;
}

static void push_vert(AwtsTextRenderer* tr, float x, float y, float u, float v) {
	if (tr->vertCount + 4 > tr->vertCap) return;
	float* p = tr->verts + tr->vertCount;
	p[0] = x; p[1] = y; p[2] = u; p[3] = v;
	tr->vertCount += 4;
}

void awts_text_draw(AwtsTextRenderer* tr, float x, float y, float scale,
		float r, float g, float b, const char* text) {
	if (!tr || !tr->ok || !text || scale <= 0.0f) return;
	if (r != tr->curR || g != tr->curG || b != tr->curB) {
		flush_quads(tr);
		tr->curR = r; tr->curG = g; tr->curB = b;
	}
	float cx = x;
	float gw = 8.0f * scale, gh = 8.0f * scale;
	for (const unsigned char* p = (const unsigned char*)text; *p; p++) {
		unsigned c = *p;
		if (c == '\n') { continue; }
		int gi = (c >= 32 && c < 127) ? (int)(c - 32) : 0;
		float u0 = ((gi % 16) * 8) / 128.0f;
		float v0 = ((gi / 16) * 8) / 48.0f;
		float u1 = u0 + 8.0f / 128.0f;
		float v1 = v0 + 8.0f / 48.0f;
		float x0 = cx, y0 = y, x1 = cx + gw, y1 = y + gh;
		push_vert(tr, x0, y0, u0, v0);
		push_vert(tr, x1, y0, u1, v0);
		push_vert(tr, x1, y1, u1, v1);
		push_vert(tr, x0, y0, u0, v0);
		push_vert(tr, x1, y1, u1, v1);
		push_vert(tr, x0, y1, u0, v1);
		cx += gw;
	}
}

void awts_text_end(AwtsTextRenderer* tr) {
	flush_quads(tr);
	glUseProgram(0);
}

float awts_text_width(const char* text, float scale) {
	size_t n = text ? strlen(text) : 0;
	return (float)n * 8.0f * scale;
}

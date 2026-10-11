/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the minimal OpenGL ES ABI needed
 * by a NativeActivity GL app.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK/Khronos source, header, or documentation text.
 * Only the public ABI facts (type names, function names, signatures, enum
 * constants) are declared here, in our own wording, so Awtsmoos-compiled
 * native code can issue GLES calls on a real Android device.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/frameworkWebGles.js
 *   geelooy/apps/android-emulator/core/android/webglGlesCoreReplay.js
 *   geelooy/apps/android-emulator/core/android/webglGlesDrawReplay.js
 *   geelooy/apps/android-emulator/core/android/webglGlesTextureReplay.js
 *   geelooy/apps/android-emulator/core/android/webglGlesUniformReplay.js
 *   geelooy/apps/android-emulator/core/android/webglPresenter.js
 * define how the GLES command stream is captured, replayed, and presented
 * while the app is being emulated.
 *
 * On-device binding: gl* resolve to the real libGLESv2 at load time. In the
 * emulator: GL calls are recorded into the JS replay pipeline above and
 * presented through the WebGL presenter.
 */

#ifndef AWTSMOOS_ANDROID_GLES_H
#define AWTSMOOS_ANDROID_GLES_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* GLES scalar types. */
typedef uint32_t GLenum;
typedef uint8_t  GLboolean;
typedef uint32_t GLbitfield;
typedef int8_t   GLbyte;
typedef int16_t  GLshort;
typedef int32_t  GLint;
typedef int32_t  GLsizei;
typedef uint8_t  GLubyte;
typedef uint16_t GLushort;
typedef uint32_t GLuint;
typedef float    GLfloat;
typedef float    GLclampf;
typedef int32_t  GLfixed;
typedef intptr_t GLintptr;
typedef intptr_t GLsizeiptr;
typedef char     GLchar;

/* Boolean and buffer-clear constants. */
#define AWTSMOOS_GL_FALSE 0
#define AWTSMOOS_GL_TRUE  1
#define AWTSMOOS_GL_COLOR_BUFFER_BIT   0x00004000
#define AWTSMOOS_GL_DEPTH_BUFFER_BIT   0x00000100
#define AWTSMOOS_GL_STENCIL_BUFFER_BIT 0x00000400
#define GL_FALSE AWTSMOOS_GL_FALSE
#define GL_TRUE  AWTSMOOS_GL_TRUE
#define GL_COLOR_BUFFER_BIT   AWTSMOOS_GL_COLOR_BUFFER_BIT
#define GL_DEPTH_BUFFER_BIT   AWTSMOOS_GL_DEPTH_BUFFER_BIT
#define GL_STENCIL_BUFFER_BIT AWTSMOOS_GL_STENCIL_BUFFER_BIT

/* Primitive types. */
#define AWTSMOOS_GL_POINTS         0x0000
#define AWTSMOOS_GL_LINES          0x0001
#define AWTSMOOS_GL_LINE_STRIP     0x0003
#define AWTSMOOS_GL_TRIANGLES      0x0004
#define AWTSMOOS_GL_TRIANGLE_STRIP 0x0005
#define AWTSMOOS_GL_TRIANGLE_FAN   0x0006
#define GL_POINTS         AWTSMOOS_GL_POINTS
#define GL_LINES          AWTSMOOS_GL_LINES
#define GL_LINE_STRIP     AWTSMOOS_GL_LINE_STRIP
#define GL_TRIANGLES      AWTSMOOS_GL_TRIANGLES
#define GL_TRIANGLE_STRIP AWTSMOOS_GL_TRIANGLE_STRIP
#define GL_TRIANGLE_FAN   AWTSMOOS_GL_TRIANGLE_FAN

/* Data types and buffer targets. */
#define AWTSMOOS_GL_UNSIGNED_BYTE  0x1401
#define AWTSMOOS_GL_UNSIGNED_SHORT 0x1403
#define AWTSMOOS_GL_UNSIGNED_INT   0x1405
#define AWTSMOOS_GL_FLOAT          0x1406
#define AWTSMOOS_GL_ARRAY_BUFFER   0x8892
#define AWTSMOOS_GL_ELEMENT_ARRAY_BUFFER 0x8893
#define AWTSMOOS_GL_STATIC_DRAW    0x88E4
#define AWTSMOOS_GL_DYNAMIC_DRAW   0x88E8
#define GL_UNSIGNED_BYTE  AWTSMOOS_GL_UNSIGNED_BYTE
#define GL_UNSIGNED_SHORT AWTSMOOS_GL_UNSIGNED_SHORT
#define GL_UNSIGNED_INT   AWTSMOOS_GL_UNSIGNED_INT
#define GL_FLOAT          AWTSMOOS_GL_FLOAT
#define GL_ARRAY_BUFFER   AWTSMOOS_GL_ARRAY_BUFFER
#define GL_ELEMENT_ARRAY_BUFFER AWTSMOOS_GL_ELEMENT_ARRAY_BUFFER
#define GL_STATIC_DRAW    AWTSMOOS_GL_STATIC_DRAW
#define GL_DYNAMIC_DRAW   AWTSMOOS_GL_DYNAMIC_DRAW

/* Capability / test enums. */
#define AWTSMOOS_GL_DEPTH_TEST  0x0B71
#define AWTSMOOS_GL_BLEND       0x0BE2
#define AWTSMOOS_GL_CULL_FACE   0x0B44
#define AWTSMOOS_GL_TEXTURE_2D  0x0DE1
#define GL_DEPTH_TEST AWTSMOOS_GL_DEPTH_TEST
#define GL_BLEND      AWTSMOOS_GL_BLEND
#define GL_CULL_FACE  AWTSMOOS_GL_CULL_FACE
#define GL_TEXTURE_2D AWTSMOOS_GL_TEXTURE_2D

/* Texture units, formats, filters. */
#define AWTSMOOS_GL_TEXTURE0       0x84C0
#define AWTSMOOS_GL_RGBA           0x1908
#define AWTSMOOS_GL_RGB            0x1907
#define AWTSMOOS_GL_LUMINANCE      0x1909
#define AWTSMOOS_GL_TEXTURE_MIN_FILTER 0x2801
#define AWTSMOOS_GL_TEXTURE_MAG_FILTER 0x2800
#define AWTSMOOS_GL_TEXTURE_WRAP_S 0x2802
#define AWTSMOOS_GL_TEXTURE_WRAP_T 0x2803
#define AWTSMOOS_GL_LINEAR         0x2601
#define AWTSMOOS_GL_NEAREST        0x2600
#define AWTSMOOS_GL_CLAMP_TO_EDGE  0x812F
#define GL_TEXTURE0       AWTSMOOS_GL_TEXTURE0
#define GL_RGBA           AWTSMOOS_GL_RGBA
#define GL_RGB            AWTSMOOS_GL_RGB
#define GL_LUMINANCE      AWTSMOOS_GL_LUMINANCE
#define GL_TEXTURE_MIN_FILTER AWTSMOOS_GL_TEXTURE_MIN_FILTER
#define GL_TEXTURE_MAG_FILTER AWTSMOOS_GL_TEXTURE_MAG_FILTER
#define GL_TEXTURE_WRAP_S AWTSMOOS_GL_TEXTURE_WRAP_S
#define GL_TEXTURE_WRAP_T AWTSMOOS_GL_TEXTURE_WRAP_T
#define GL_LINEAR         AWTSMOOS_GL_LINEAR
#define GL_NEAREST        AWTSMOOS_GL_NEAREST
#define GL_CLAMP_TO_EDGE  AWTSMOOS_GL_CLAMP_TO_EDGE

/* Shader types and states. */
#define AWTSMOOS_GL_VERTEX_SHADER   0x8B31
#define AWTSMOOS_GL_FRAGMENT_SHADER 0x8B30
#define AWTSMOOS_GL_COMPILE_STATUS  0x8B81
#define AWTSMOOS_GL_LINK_STATUS     0x8B82
#define AWTSMOOS_GL_INFO_LOG_LENGTH 0x8B84
#define AWTSMOOS_GL_NO_ERROR        0
#define GL_VERTEX_SHADER   AWTSMOOS_GL_VERTEX_SHADER
#define GL_FRAGMENT_SHADER AWTSMOOS_GL_FRAGMENT_SHADER
#define GL_COMPILE_STATUS  AWTSMOOS_GL_COMPILE_STATUS
#define GL_LINK_STATUS     AWTSMOOS_GL_LINK_STATUS
#define GL_INFO_LOG_LENGTH AWTSMOOS_GL_INFO_LOG_LENGTH
#define GL_NO_ERROR        AWTSMOOS_GL_NO_ERROR

/* Framebuffer / viewport state. */
void glViewport(GLint x, GLint y, GLsizei width, GLsizei height);
void glClearColor(GLclampf red, GLclampf green, GLclampf blue,
                  GLclampf alpha);
void glClear(GLbitfield mask);
void glEnable(GLenum cap);
void glDisable(GLenum cap);
GLenum glGetError(void);
void glFlush(void);
void glFinish(void);

/* Buffer objects. */
void glGenBuffers(GLsizei n, GLuint* buffers);
void glDeleteBuffers(GLsizei n, const GLuint* buffers);
void glBindBuffer(GLenum target, GLuint buffer);
void glBufferData(GLenum target, GLsizeiptr size, const void* data,
                  GLenum usage);

/* Textures. */
void glGenTextures(GLsizei n, GLuint* textures);
void glDeleteTextures(GLsizei n, const GLuint* textures);
void glBindTexture(GLenum target, GLuint texture);
void glActiveTexture(GLenum texture);
void glTexParameteri(GLenum target, GLenum pname, GLint param);
void glTexImage2D(GLenum target, GLint level, GLint internalformat,
                  GLsizei width, GLsizei height, GLint border,
                  GLenum format, GLenum type, const void* pixels);
void glTexSubImage2D(GLenum target, GLint level, GLint xoffset,
                     GLint yoffset, GLsizei width, GLsizei height,
                     GLenum format, GLenum type, const void* pixels);
void glGenerateMipmap(GLenum target);

/* Shaders and programs. */
GLuint glCreateShader(GLenum type);
void glDeleteShader(GLuint shader);
void glShaderSource(GLuint shader, GLsizei count,
                    const GLchar* const* string, const GLint* length);
void glCompileShader(GLuint shader);
void glGetShaderiv(GLuint shader, GLenum pname, GLint* params);
void glGetShaderInfoLog(GLuint shader, GLsizei bufSize, GLsizei* length,
                        GLchar* infoLog);
GLuint glCreateProgram(void);
void glDeleteProgram(GLuint program);
void glAttachShader(GLuint program, GLuint shader);
void glDetachShader(GLuint program, GLuint shader);
void glLinkProgram(GLuint program);
void glUseProgram(GLuint program);
void glGetProgramiv(GLuint program, GLenum pname, GLint* params);
void glGetProgramInfoLog(GLuint program, GLsizei bufSize, GLsizei* length,
                         GLchar* infoLog);
GLint glGetAttribLocation(GLuint program, const GLchar* name);
GLint glGetUniformLocation(GLuint program, const GLchar* name);

/* Vertex attributes and drawing. */
void glEnableVertexAttribArray(GLuint index);
void glDisableVertexAttribArray(GLuint index);
void glVertexAttribPointer(GLuint index, GLint size, GLenum type,
                           GLboolean normalized, GLsizei stride,
                           const void* pointer);
void glDrawArrays(GLenum mode, GLint first, GLsizei count);
void glDrawElements(GLenum mode, GLsizei count, GLenum type,
                    const void* indices);

/* Uniforms. */
void glUniform1i(GLint location, GLint v0);
void glUniform1f(GLint location, GLfloat v0);
void glUniform2f(GLint location, GLfloat v0, GLfloat v1);
void glUniform3f(GLint location, GLfloat v0, GLfloat v1, GLfloat v2);
void glUniform4f(GLint location, GLfloat v0, GLfloat v1, GLfloat v2,
                 GLfloat v3);
void glUniformMatrix4fv(GLint location, GLsizei count, GLboolean transpose,
                        const GLfloat* value);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_GLES_H */

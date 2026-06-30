// B"H
#include "awtai_mmap_project.h"
#include "awtai_quant_dispatch.h"
#include <fcntl.h>
#include <math.h>
#include <stdint.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

static void seed_topk(awtai_topk_item *out, int k){for(int i=0;i<k;i++){out[i].id=-1;out[i].logit=-INFINITY;}}
static void push_topk(awtai_topk_item*out,int k,int id,float logit){if(!isfinite(logit)||k<=0)return;int s=k;for(int i=0;i<k;i++)if(logit>out[i].logit){s=i;break;}if(s>=k)return;for(int i=k-1;i>s;i--)out[i]=out[i-1];out[s].id=id;out[s].logit=logit;}
static int file_has(int fd,uint64_t end){struct stat st;if(fstat(fd,&st)!=0)return 0;return (uint64_t)st.st_size>=end;}
static int map_window(int fd,uint64_t off,uint64_t len,void**base,void**ptr,size_t*map_len){long page=sysconf(_SC_PAGESIZE);uint64_t mask=(uint64_t)page-1,aligned=off&~mask,delta=off-aligned;*map_len=(size_t)(len+delta);*base=mmap(NULL,*map_len,PROT_READ,MAP_PRIVATE,fd,(off_t)aligned);if(*base==MAP_FAILED)return 0;*ptr=(void*)((char*)(*base)+delta);return 1;}
static float f32_dot(const float *w, int cols, const float *x){float s=0.0f;for(int i=0;i<cols;i++)s+=w[i]*x[i];return s;}

int awtai_mmap_quant_project(const char*path,uint64_t offset,int type,int rows,int cols,const float*input,float*out,int window_rows){if(!path||!input||!out||rows<=0||cols<=0||!awtai_type_supported(type))return 0;int stride=awtai_row_bytes(type,cols);if(stride<=0)return 0;if(window_rows<=0||window_rows>4096)window_rows=256;int fd=open(path,O_RDONLY);if(fd<0)return 0;uint64_t need=offset+(uint64_t)rows*(uint64_t)stride;if(!file_has(fd,need)){close(fd);return 0;}for(int start=0;start<rows;start+=window_rows){int count=rows-start<window_rows?rows-start:window_rows;uint64_t off=offset+(uint64_t)start*(uint64_t)stride;uint64_t len=(uint64_t)count*(uint64_t)stride;void*base=NULL,*raw=NULL;size_t map_len=0;if(!map_window(fd,off,len,&base,&raw,&map_len)){close(fd);return 0;}for(int r=0;r<count;r++)out[start+r]=awtai_dot_row(type,(const uint8_t*)raw+(uint64_t)r*(uint64_t)stride,cols,input);munmap(base,map_len);}close(fd);return 1;}

/*
 * B"H
 * mmap LM-head top-k with no framework math call. Each row is a raw C dot;
 * the model remains on disk and only the current mapped window is revealed.
 */
int awtai_mmap_f32_topk(const char*path,int rows,int cols,const float*input,int k,int window_rows,awtai_topk_item*out){if(!path||!input||!out||rows<=0||cols<=0||k<=0)return 0;if(window_rows<=0||window_rows>4096)window_rows=512;int fd=open(path,O_RDONLY);if(fd<0)return 0;uint64_t need=(uint64_t)rows*(uint64_t)cols*sizeof(float);if(!file_has(fd,need)){close(fd);return 0;}seed_topk(out,k);for(int start=0;start<rows;start+=window_rows){int count=rows-start<window_rows?rows-start:window_rows;uint64_t off=(uint64_t)start*(uint64_t)cols*sizeof(float);uint64_t len=(uint64_t)count*(uint64_t)cols*sizeof(float);void*base=NULL,*ptr=NULL;size_t map_len=0;if(!map_window(fd,off,len,&base,&ptr,&map_len)){close(fd);return 0;}for(int i=0;i<count;i++)push_topk(out,k,start+i,f32_dot((float*)ptr+(size_t)i*(size_t)cols,cols,input));munmap(base,map_len);}close(fd);return 1;}

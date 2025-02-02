//B"H
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int shiftOutwards(const char *filePath, off_t byteOffset, off_t amount) {
    int fd = open(filePath, O_RDWR);
    if (fd == -1) {
        perror("open");
        return -1;
    }

    // Verify the file type (should be a regular file)
    struct stat fileStat;
    if (fstat(fd, &fileStat) == -1) {
        perror("fstat");
        close(fd);
        return -1;
    }

    if (!S_ISREG(fileStat.st_mode)) {
        fprintf(stderr, "Error: %s is not a regular file.\n", filePath);
        close(fd);
        return -1;
    }

    // Moving the file pointer to the offset
    if (lseek(fd, byteOffset, SEEK_SET) == -1) {
        perror("lseek");
        close(fd);
        return -1;
    }

    // Write dummy data to create space (you can write any value here)
    char *buffer = (char *)malloc(amount);
    if (buffer == NULL) {
        perror("malloc");
        close(fd);
        return -1;
    }
    memset(buffer, 0, amount);  // Initialize buffer with zeroes

    ssize_t bytesWritten = write(fd, buffer, amount);
    if (bytesWritten == -1) {
        perror("write");
        free(buffer);
        close(fd);
        return -1;
    }

    free(buffer);
    close(fd);
    return 0;
}

int shiftInwards(const char *filePath, off_t offsetStartBytes, off_t amount) {
    int fd = open(filePath, O_RDWR);
    if (fd == -1) {
        perror("open");
        return -1;
    }

    // Verify the file type (should be a regular file)
    struct stat fileStat;
    if (fstat(fd, &fileStat) == -1) {
        perror("fstat");
        close(fd);
        return -1;
    }

    if (!S_ISREG(fileStat.st_mode)) {
        fprintf(stderr, "Error: %s is not a regular file.\n", filePath);
        close(fd);
        return -1;
    }

    // Truncate file from the specified start offset
    if (ftruncate(fd, offsetStartBytes) == -1) {
        perror("ftruncate");
        close(fd);
        return -1;
    }

    close(fd);
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc != 5) {
        fprintf(stderr, "Usage: %s <file> <offset> <amount> <in|out>\n", argv[0]);
        return 1;
    }

    const char *filePath = argv[1];
    off_t offset = atoll(argv[2]);
    off_t amount = atoll(argv[3]);
    const char *mode = argv[4];

    if (strcmp(mode, "out") == 0) {
        return shiftOutwards(filePath, offset, amount);
    } else if (strcmp(mode, "in") == 0) {
        return shiftInwards(filePath, offset, amount);
    } else {
        fprintf(stderr, "Invalid mode: use 'in' or 'out'\n");
        return 1;
    }
}

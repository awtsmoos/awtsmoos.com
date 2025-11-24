//B"H
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <time.h>
// Define block size (for simplicity, assuming 4KB)
#define BLOCK_SIZE 4096

// Structs for superblock and block group descriptor
struct ext4_super_block {
    uint32_t s_inodes_count;
    uint32_t s_blocks_count;
    uint32_t s_r_blocks_count;
    uint32_t s_free_blocks_count;
    uint32_t s_free_inodes_count;
    uint32_t s_first_data_block;
    uint32_t s_log_block_size;
    uint32_t s_log_cluster_size;
    uint32_t s_blocks_per_group;
    uint32_t s_inodes_per_group;
    uint32_t s_mtime;
    uint32_t s_wtime;
    uint16_t s_mnt_count;
    uint16_t s_max_mnt_count;
    uint16_t s_magic;
    uint16_t s_state;
    uint16_t s_errors;
    uint16_t s_minor_rev_level;
    uint32_t s_lastcheck;
    uint32_t s_checkinterval;
    uint32_t s_creator_os;
    uint32_t s_rev_level;
    uint16_t s_def_resuid;
    uint16_t s_def_resgid;
    uint32_t s_first_ino;
    uint16_t s_inode_size;
    uint16_t s_block_group_nr;
    uint32_t s_feature_compat;
    uint32_t s_feature_incompat;
    uint32_t s_feature_ro_compat;
    uint8_t s_uuid[16];
    uint8_t s_volume_name[16];
    uint8_t s_last_mounted[64];
    uint32_t s_algorithm_usage_bitmap;
};

// Block group descriptor structure
struct ext4_group_desc {
    uint32_t bg_block_bitmap;
    uint32_t bg_inode_bitmap;
    uint32_t bg_inode_table;
    uint16_t bg_free_blocks_count;
    uint16_t bg_free_inodes_count;
    uint16_t bg_used_dirs_count;
    uint16_t bg_pad;
};

// Function to read and print superblock info
void read_superblock(int fd) {
    struct ext4_super_block sb;
    lseek(fd, 1024, SEEK_SET);  // Superblock starts at offset 1024 bytes (typically)
    read(fd, &sb, sizeof(sb));

    printf("Superblock Information:\n");
    printf("Inode Count: %u\n", sb.s_inodes_count);
    printf("Block Count: %u\n", sb.s_blocks_count);
    printf("Block Size: %u bytes\n", BLOCK_SIZE);
    printf("First Data Block: %u\n", sb.s_first_data_block);
    printf("Blocks per Group: %u\n", sb.s_blocks_per_group);
    printf("Inodes per Group: %u\n", sb.s_inodes_per_group);
    printf("Block group number: %u\n", sb.s_block_group_nr);

    printf("Volume names: %hhn\n", sb.s_volume_name);
}

// Function to read and print block group descriptor info
void read_block_group_descriptor(int fd, uint32_t block_group_num) {
    struct ext4_group_desc bg_desc;
    uint32_t bg_offset = 1024 + (block_group_num * sizeof(struct ext4_group_desc));

    lseek(fd, bg_offset, SEEK_SET);
    read(fd, &bg_desc, sizeof(bg_desc));

    printf("Block Group %u Information:\n", block_group_num);
    printf("Block Bitmap: %u\n", bg_desc.bg_block_bitmap);
    printf("Inode Bitmap: %u\n", bg_desc.bg_inode_bitmap);
    printf("Inode Table: %u\n", bg_desc.bg_inode_table);
    printf("Free Blocks: %u\n", bg_desc.bg_free_blocks_count);
    printf("Free Inodes: %u\n", bg_desc.bg_free_inodes_count);
    printf("Used Directories: %u\n", bg_desc.bg_used_dirs_count);
}

void print_inode_info(const char *filePath) {
    struct stat fileStat;

    // Retrieve file statistics using stat
    if (stat(filePath, &fileStat) == -1) {
        perror("Failed to get file stats");
        return;
    }

    // Print the inode information in a human-readable format
    printf("Inode: %ld\n", (long)fileStat.st_ino);
    printf("Size: %lld bytes\n", (long long)fileStat.st_size);
    printf("Permissions: ");
    printf((S_ISDIR(fileStat.st_mode)) ? "d" : "-");
    printf((fileStat.st_mode & S_IRUSR) ? "r" : "-");
    printf((fileStat.st_mode & S_IWUSR) ? "w" : "-");
    printf((fileStat.st_mode & S_IXUSR) ? "x" : "-");
    printf((fileStat.st_mode & S_IRGRP) ? "r" : "-");
    printf((fileStat.st_mode & S_IWGRP) ? "w" : "-");
    printf((fileStat.st_mode & S_IXGRP) ? "x" : "-");
    printf((fileStat.st_mode & S_IROTH) ? "r" : "-");
    printf((fileStat.st_mode & S_IWOTH) ? "w" : "-");
    printf((fileStat.st_mode & S_IXOTH) ? "x" : "-");
    printf("\n");

    // Print timestamps (creation, modification, and access times)
    char timeBuf[64];
    struct tm *timeInfo;

    timeInfo = localtime(&fileStat.st_ctime);  // File creation time
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%d %H:%M:%S", timeInfo);
    printf("Created: %s\n", timeBuf);

    timeInfo = localtime(&fileStat.st_mtime);  // Last modification time
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%d %H:%M:%S", timeInfo);
    printf("Modified: %s\n", timeBuf);

    timeInfo = localtime(&fileStat.st_atime);  // Last access time
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%d %H:%M:%S", timeInfo);
    printf("Accessed: %s\n", timeBuf);

    // Print the number of blocks allocated to the file
    printf("Number of Blocks: %lld\n", (long long)fileStat.st_blocks);
    // Print the block size
    printf("Block Size: %ld bytes\n", fileStat.st_blksize);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <filePath>\n", argv[0]);
        return 1;
    }

    const char *filePath = argv[1];  // Get the file path from the command line argument

    // Print inode information
    print_inode_info(filePath);

    const char *diskPath= "/dev/sda5";
    int fd = open(diskPath, O_RDONLY);
    if (fd == -1) {
        perror("Error opening file");
        return 1;
    }

    // Read superblock and block group descriptors
    read_superblock(fd);

    // Let's print the first block group descriptor (for simplicity)
    read_block_group_descriptor(fd, 2);

    close(fd);

    return 0;
}
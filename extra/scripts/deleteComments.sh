#B"H
#!/bin/bash
for dir in */; do
    if [ -d "$dir/comments" ]; then
        echo "Deleting $dir/comments"
        rm -rf "$dir/comments"
    fi
done

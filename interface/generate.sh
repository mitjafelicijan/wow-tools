#!/usr/bin/env bash

# Usage: bash blp2png.sh ~/Junk/Work/ 1.12/ ../external/

if [ "$#" -lt 3 ]; then
    echo "Usage: $0 workdir outputdir toolsdir"
    exit 1
fi

WORK_DIR="$1"
OUTPUT_DIR="$2"
TOOLS_DIR="$3"

cp "$WORK_DIR/(listfile)" "$WORK_DIR/listfile"
sed -i 's/\\/\//g' "$WORK_DIR/listfile" # Convert backslashes to forward slashes
sed -i 's/\r$//' "$WORK_DIR/listfile" # Remove carriage returns
mkdir -p "$OUTPUT_DIR/assets"

echo "Work directory:   $WORK_DIR"
echo "Output directory: $OUTPUT_DIR"
echo "Tools directory:  $TOOLS_DIR"
echo

if [ -f "$OUTPUT_DIR/assets/listfile.txt" ]; then
    rm -f "$OUTPUT_DIR/assets/listfile.txt"
fi

counter=1
numassets=$(grep -c "\.blp" "$WORK_DIR/listfile")

while read -r line; do
    if [[ $line == *".blp"* ]]; then
        namespace=$(dirname "$line")
        filename=$(basename "$line")
        pngfile=$(echo $line | sed 's/\.blp$/.png/')

        mkdir -p "$OUTPUT_DIR/assets/$namespace"
        wine "$TOOLS_DIR/BLP2PNG.exe" "$WORK_DIR/$line"
        mv "$WORK_DIR/$pngfile" "$OUTPUT_DIR/assets/$namespace"

        echo "$namespace;$filename" >> "$OUTPUT_DIR/assets/listfile.txt"
        
        echo "[$counter/$numassets]" $line
        ((counter++))
    fi
done < "$WORK_DIR/listfile"

# gh run list --limit 1000 > action-runs.txt

filename="$1"
while read -r line; do
  gh run view $line --log | grep "Z data/"
done < "$filename"
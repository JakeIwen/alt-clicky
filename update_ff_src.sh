project_folder='/Users/jacobr/dev/alt-clicky'
# sideload_alt_clicky_folder='/Users/jacobr/Library/Application Support/Firefox/Profiles/zgyzvnb3.default-release/distribution/extensions/alt-clicky-dev@gmail.com"'
sideload_alt_clicky_folder='/Users/jacobr/Library/Application Support/Firefox/Profiles/mbgdlgf3.default/distribution/extensions/alt-clicky-dev@gmail.com"'

rm -rf "$project_folder/web-ext-artifacts"
rm -rf "$sideload_alt_clicky_folder"
mkdir -p "$sideload_alt_clicky_folder"
cp -r "$project_folder/" "$sideload_alt_clicky_folder/"
echo "done"


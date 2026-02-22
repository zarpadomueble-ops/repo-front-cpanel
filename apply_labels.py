import json
import re

with open('image_descriptions.json') as f:
    labels = json.load(f)

with open('js/script.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'resolveAssetPath' in line and 'desktop-16x9/' in line:
        m = re.search(r"desktop-16x9/(.*?\.webp)", line)
        if m:
            filename = m.group(1)
            if filename in labels:
                name = labels[filename]['name']
                spec = labels[filename]['spec']
                
                # Check if it's a single-line object (like QUOTE_PRODUCTS)
                if 'name:' in line and 'specs:' in line:
                    lines[i] = re.sub(r"name: '.*?'", f"name: '{name}'", lines[i])
                    lines[i] = re.sub(r"specs: '.*?'", f"specs: '{spec}'", lines[i])
                else:
                    # Multi-line object
                    for j in range(i, i-5, -1):
                        if 'name:' in lines[j] and 'id:' not in lines[j]:
                            lines[j] = re.sub(r"name: '.*?'", f"name: '{name}'", lines[j])
                        if 'specs:' in lines[j]:
                            lines[j] = re.sub(r"specs: '.*?'", f"specs: '{spec}'", lines[j])

with open('js/script.js', 'w') as f:
    f.writelines(lines)
print("Updated js/script.js")

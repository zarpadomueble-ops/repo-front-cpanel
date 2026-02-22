import re

with open('js/script.js', 'r') as f:
    js_content = f.read()

products_map = {}
blocks = re.findall(r"id:\s*(\d+),\s*name:\s*'(.*?)',\s*specs:\s*'(.*?)'", js_content)
for b in blocks:
    products_map[b[0]] = { 'name': b[1], 'specs': b[2] }

with open('tienda.html', 'r') as f:
    html_lines = f.readlines()

current_name_idx = -1
current_specs_idx = -1

for i, line in enumerate(html_lines):
    if 'class="product-name"' in line:
        current_name_idx = i
    elif 'class="product-specs"' in line:
        current_specs_idx = i
    elif 'data-product-id="' in line:
        m = re.search(r'data-product-id="(\d+)"', line)
        if m:
            pid = m.group(1)
            if pid in products_map:
                name = products_map[pid]['name']
                specs = products_map[pid]['specs']
                if current_name_idx != -1:
                    html_lines[current_name_idx] = re.sub(r'>.*?<', f'>{name}<', html_lines[current_name_idx])
                if current_specs_idx != -1:
                    html_lines[current_specs_idx] = re.sub(r'>.*?<', f'>{specs}<', html_lines[current_specs_idx])
            current_name_idx = -1
            current_specs_idx = -1

with open('tienda.html', 'w') as f:
    f.writelines(html_lines)
print("Updated tienda.html")

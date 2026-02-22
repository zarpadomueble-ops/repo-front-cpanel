
import os
import re
import datetime

# Timestamp for versioning
TIMESTAMP = datetime.datetime.now().strftime("%Y%m%d%H%M")
VERSION_PARAM = f"?v={TIMESTAMP}"

# Directory to scan (current directory)
ROOT_DIR = "."

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    original_content = content

    # Function to replace href in <link rel="stylesheet">
    def replace_css_href(match):
        prefix = match.group(1) # <link ... href=
        quote = match.group(2)  # " or '
        url = match.group(3)    # path/to/file.css
        suffix = match.group(4) # quote + rest
        
        # Check if external
        if url.strip().startswith(('http:', 'https:', '//')):
            return match.group(0) # No change
        
        # Remove existing query string
        if '?' in url:
            url = url.split('?')[0]
            
        return f'{prefix}{quote}{url}{VERSION_PARAM}{quote}'

    # Function to replace src in <script>
    def replace_js_src(match):
        prefix = match.group(1) # <script ... src=
        quote = match.group(2)  # " or '
        url = match.group(3)    # path/to/file.js
        suffix = match.group(4) # quote + rest
        
        # Check if external
        if url.strip().startswith(('http:', 'https:', '//')):
            return match.group(0) # No change

        # Remove existing query string
        if '?' in url:
            url = url.split('?')[0]
            
        return f'{prefix}{quote}{url}{VERSION_PARAM}{quote}'

    # Regex for CSS: <link ... href="..." ...>
    # We look for href="...css"
    # This is a bit loose but effective.
    # Pattern: (href=)(['"])(.*?\.css)(['"])
    content = re.sub(r'(href=)([\'"])(.*?\.css)([\'"])', replace_css_href, content, flags=re.IGNORECASE)

    # Regex for JS: <script ... src="..." ...>
    # Pattern: (src=)(['"])(.*?\.js)(['"])
    content = re.sub(r'(src=)([\'"])(.*?\.js)([\'"])', replace_js_src, content, flags=re.IGNORECASE)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
    else:
        # print(f"No changes: {filepath}")
        pass

def main():
    print(f"Applying version: {VERSION_PARAM}")
    for root, dirs, files in os.walk(ROOT_DIR):
        if '.git' in dirs: dirs.remove('.git')
        if 'node_modules' in dirs: dirs.remove('node_modules')
        
        for file in files:
            if file.endswith(".html"):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()

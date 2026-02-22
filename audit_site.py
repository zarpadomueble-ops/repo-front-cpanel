
import os
import re
import urllib.parse

ROOT_DIR = "."

# Known directories with Capital letters
KNOWN_DIRS = ['Assets', 'Assets_pc', 'Assets_mov']

def check_file(filepath):
    issues = []
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        lines = content.split('\n')

    for i, line in enumerate(lines):
        line_num = i + 1
        
        # 1. Mixed Content
        if 'http://' in line:
            # Ignore some common non-resource links if necessary, but generally flag all
            if 'w3.org' not in line and 'schema.org' not in line: 
                issues.append(f"Line {line_num}: Mixed Content (http://) found")

        # 2. Case Sensitivity Check
        # Look for /assets/ or /assets_pc/ or /assets_mov/ in lowercase
        lower_line = line.lower()
        
        if '/assets/' in lower_line and '/Assets/' not in line:
             issues.append(f"Line {line_num}: Case sensitivity warning: '/assets/' found, expected '/Assets/'?")
        
        if '/assets_pc/' in lower_line and '/Assets_pc/' not in line:
             issues.append(f"Line {line_num}: Case sensitivity warning: '/assets_pc/' found, expected '/Assets_pc/'?")

        if '/assets_mov/' in lower_line and '/Assets_mov/' not in line:
             issues.append(f"Line {line_num}: Case sensitivity warning: '/assets_mov/' found, expected '/Assets_mov/'?")

        # 3. Check for broken local links (simple check)
        # Find src="..." or href="..."
        matches = re.findall(r'(src|href)=["\']([^"\']+)["\']', line)
        for attr, url in matches:
            # Skip external, anchors, mailto, tel
            if url.startswith(('http', '//', '#', 'mailto:', 'tel:', 'javascript:')):
                continue
            
            # Remove query string/hash
            clean_url = url.split('?')[0].split('#')[0]
            
            # Absolute path from root
            if clean_url.startswith('/'):
                target_path = os.path.join(ROOT_DIR, clean_url.lstrip('/'))
            else:
                # Relative path
                target_path = os.path.join(os.path.dirname(filepath), clean_url)
            
            # Check if file/dir exists
            if not os.path.exists(target_path):
                 # Try adding .html if not present
                 if not os.path.exists(target_path + '.html'):
                     issues.append(f"Line {line_num}: Broken link/resource? '{url}' -> {target_path} not found")

    if issues:
        print(f"\n--- Issues in {filepath} ---")
        for issue in issues:
            print(issue)

def main():
    print("Starting Audit...")
    for root, dirs, files in os.walk(ROOT_DIR):
        if '.git' in dirs: dirs.remove('.git')
        if 'node_modules' in dirs: dirs.remove('node_modules')
        
        for file in files:
            if file.endswith(('.html', '.css', '.js')):
                check_file(os.path.join(root, file))
    print("\nAudit Complete.")

if __name__ == "__main__":
    main()

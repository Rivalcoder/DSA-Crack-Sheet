import re
import json

def extract_structured_data():
    try:
        with open('striver_sheet.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # This page seems to use a format where data is in strings or JSON in script tags.
        # Let's find all instances of what looks like a problem object.
        # Format: {"problem_id":"...","problem_name":"...","leetcode":"..."}
        
        # Let's try to find larger chunks first.
        # Often Steps and Sections are hierarchical.
        
        # Searching for "Step " to see how it's structured.
        step_matches = list(re.finditer(r'Step \d+', content))
        for m in step_matches[:5]:
            print(f"Found {m.group()} at {m.start()}")
            print(content[m.start():m.start()+200])
            print("-" * 20)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_structured_data()

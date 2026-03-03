import re
import json

def explore():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('\\"', '"')
    
    # Find all occurrences of problem_id and print the context to see if any are outside my current parsing logic
    pids = list(re.finditer(r'"problem_id":"(\d+)"', content))
    print(f"Total problem_id matches: {len(pids)}")
    
    unique_ids = set()
    for m in pids:
        unique_ids.add(m.group(1))
    print(f"Total unique problem_ids: {len(unique_ids)}")

if __name__ == "__main__":
    explore()

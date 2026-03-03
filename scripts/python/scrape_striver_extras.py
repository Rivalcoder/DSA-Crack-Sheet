import requests
import re
import json
import os
from urllib.parse import urlparse

# List of URLs to scrape
urls = {
    "Blind 75": "https://takeuforward.org/dsa/blind-75-leetcode-problems-detailed-video-solutions",
    "Striver SDE Sheet": "https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems",
    "Striver 79 Last Moment DSA": "https://takeuforward.org/dsa/strivers-79-last-moment-dsa-sheet-ace-interviews",
    "Striver CP Sheet": "https://takeuforward.org/competitive-programming/strivers-cp-sheet",
    "System Design Roadmap": "https://takeuforward.org/system-design/complete-system-design-roadmap-with-videos-for-sdes",
    "Computer Networks": "https://takeuforward.org/computer-network/most-asked-computer-networks-interview-questions",
    "DBMS": "https://takeuforward.org/dbms/most-asked-dbms-interview-questions",
    "Operating System": "https://takeuforward.org/operating-system/most-asked-operating-system-interview-questions"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def extract_from_html(html, sheet_name):
    print(f"[{sheet_name}] Processing Next.js stream...")
    # Reassemble Next.js stream: TUF site uses self.__next_f.push([1, "..."])
    chunks = re.findall(r'self\.__next_f\.push\(\[\d+,\s*"(.*?)"\]\)', html, re.DOTALL)
    
    # If no push chunks, try to find in regular code
    if not chunks:
        # Fallback for simpler pages or different script formats
        chunks = [html]
    
    # Join and unescape
    full_content = "".join(chunks).replace('\\"', '"').replace('\\/', '/').replace('\\n', '\n')
    
    # 1. Find Categories and Subcategories with positions
    cats = []
    for m in re.finditer(r'"category_name":"(.*?)"', full_content):
        cats.append({"name": m.group(1), "pos": m.start(), "type": "cat"})
    for m in re.finditer(r'"subcategory_name":"(.*?)"', full_content):
        cats.append({"name": m.group(1), "pos": m.start(), "type": "sub"})
    cats.sort(key=lambda x: x['pos'])
    
    # 2. Extract Problem Objects
    all_extracted = []
    seen_ids = set()
    global_order = 0
    
    pos = 0
    while True:
        match = re.search(r'"problem_name":"', full_content[pos:])
        if not match: break
        
        start_search = pos + match.start()
        obj_start = full_content.rfind('{', 0, start_search)
        if obj_start == -1: 
            pos += match.end()
            continue
            
        # Balanced brace extraction
        prob_str = find_balanced(full_content, obj_start)
        if not prob_str:
            pos += match.end()
            continue
            
        try:
            # Sometimes Next.js wraps things in strings: "{\"id\":...}"
            p = json.loads(prob_str)
            if isinstance(p, dict) and ('problem_name' in p or 'title' in p):
                pid = str(p.get('problem_id') or p.get('id') or p.get('problem_name'))
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    
                    # Assign to nearest preceding section
                    curr_cat = "General"
                    curr_sub = "General"
                    for cat in cats:
                        if cat['pos'] < obj_start:
                            if cat['type'] == 'cat': curr_cat = cat['name']
                            if cat['type'] == 'sub': curr_sub = cat['name']
                        else: break
                    
                    global_order += 1
                    all_extracted.append(create_problem_obj(p, curr_cat, curr_sub, sheet_name, global_order))
        except: pass
        
        pos = obj_start + len(prob_str)
        
    return all_extracted

def find_balanced(s, start):
    count = 0
    for i in range(start, len(s)):
        if s[i] == '{': count += 1
        elif s[i] == '}':
            count -= 1
            if count == 0: return s[start:i+1]
    return None

def create_problem_obj(p, section, pattern, sheet_name, order):
    title = p.get('problem_name') or p.get('title')
    yt = p.get('youtube')
    lc = p.get('leetcode')
    art = p.get('article')
    diff = p.get('difficulty', 'Medium')
    
    pid = p.get('problem_id') or p.get('id') or 0
    # Clean up difficulty
    diff_str = str(diff) if diff else 'Medium'
    if diff_str == '$undefined': diff_str = 'Medium'
    
    # URL Logic
    url = lc if (lc and lc != '$undefined' and lc != '') else art
    if not url or url == '$undefined' or url == '':
        url = p.get('link') if (p.get('link') != '$undefined' and p.get('link')) else '#'
        
    yt_url = yt if (yt and yt != '$undefined' and yt != '') else None
    
    # Ensure it's not a relative path if it's meant to be external
    if url.startswith('/'): url = f"https://takeuforward.org{url}"
    if yt_url and yt_url.startswith('/'): yt_url = f"https://takeuforward.org{yt_url}"

    return {
        'title': title,
        'url': url if url else '#',
        'yt_url': yt_url,
        'difficulty': diff_str,
        'section': section,
        'pattern': pattern,
        'problemId': int(pid) if str(pid).isdigit() else 0,
        'slug': str(title).lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', ''),
        'sheet': sheet_name,
        'orderIndex': order
    }

def main():
    all_extracted_problems = []
    total_sheets = len(urls)
    
    for i, (sheet_name, url) in enumerate(urls.items(), 1):
        print(f"[{i}/{total_sheets}] Scraping {sheet_name}...")
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code == 200:
                probs = extract_from_html(resp.text, sheet_name)
                print(f"OK: Found {len(probs)} problems")
                all_extracted_problems.extend(probs)
        except Exception as e:
            print(f"Error scraping {sheet_name}: {e}")

    output_path = 'data/striver_extras.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_extracted_problems, f, indent=2)
    
    print(f"\nTotal problems across all sheets: {len(all_extracted_problems)}")

if __name__ == "__main__":
    main()

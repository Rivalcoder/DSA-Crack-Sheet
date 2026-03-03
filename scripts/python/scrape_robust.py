import re
import json

def scrape_robust():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to unescape to work with it properly if it's in a JS variable
    # But wait, it might be in multiple places. Let's just find all instances of problem objects.
    # Takeuforward often stores the whole sheet in a single JSON string.
    
    # First, let's find the largest JSON block that contains 'category_name'
    # It's usually inside a <script> tag or a data-attribute
    # Regex to find everything between [ { "category_id" ... } ]
    
    # Or simpler: let's find all category blocks.
    categories = re.findall(r'\{"category_id":".*?","category_name":".*?","subcategories":\[.*?\]\}', content)
    
    if not categories:
        # Maybe it's escaped?
        content_unescaped = content.replace('\\"', '"').replace('\\/', '/')
        categories = re.findall(r'\{"category_id":".*?","category_name":".*?","subcategories":\[.*?\]\}', content_unescaped)

    all_problems = []
    global_order = 0
    
    # If we found category blocks, let's parse them
    if categories:
        for cat_str in categories:
            try:
                cat = json.loads(cat_str)
                cat_name = cat['category_name']
                for sub in cat.get('subcategories', []):
                    sub_name = sub['subcategory_name']
                    for prob in sub.get('problems', []):
                        global_order += 1
                        title = prob['problem_name']
                        yt = prob.get('youtube')
                        lc = prob.get('leetcode')
                        art = prob.get('article')
                        
                        url = lc if (lc and lc != '$undefined') else art
                        yt_url = yt if (yt and yt != '$undefined') else None
                        
                        all_problems.append({
                            'title': title,
                            'url': url,
                            'yt_url': yt_url,
                            'difficulty': prob.get('difficulty', 'Easy'),
                            'section': cat_name,
                            'pattern': sub_name,
                            'problemId': int(prob['problem_id']) if prob['problem_id'].isdigit() else 0,
                            'slug': title.lower().replace(' ', '-').replace('/', '-'),
                            'sheet': 'Striver A2Z',
                            'orderIndex': global_order
                        })
            except Exception as e:
                print(f"Error parsing category: {e}")
                continue
    
    print(f"Extracted {len(all_problems)} problems")
    
    # If identifies fewer than expected, let's try an even broader search
    if len(all_problems) < 450:
        print("Falling back to global search...")
        # Just find every single problem object regardless of nesting
        content_unescaped = content.replace('\\"', '"').replace('\\/', '/')
        # Find all problem objects: {"problem_id":"...", "problem_name":"...", ...}
        # We use a non-greedy match for the object
        probs_raw = re.findall(r'\{"problem_id":".*?","problem_name":".*?".*?\}', content_unescaped)
        print(f"Global search found {len(probs_raw)} potential problem objects")
        
        # Deduplicate by problemId
        seen_ids = set()
        global_problems = []
        for p_str in probs_raw:
            try:
                p = json.loads(p_str)
                pid = p['problem_id']
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    # We need to find its cat/sub? Harder globally.
                    # But we can try to see where it was in the string.
                    global_problems.append(p)
            except:
                continue
        print(f"Global search found {len(global_problems)} unique problems")

    # If the nested one is good, use it.
    if len(all_problems) > 0:
        with open('striver_a2z_final.json', 'w', encoding='utf-8') as f:
            json.dump(all_problems, f, indent=2)
            print("Saved to striver_a2z_final.json")

if __name__ == "__main__":
    scrape_robust()

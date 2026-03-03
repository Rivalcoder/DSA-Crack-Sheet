import re
import json

def extract_all():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # The data is likely in a large JSON structure.
    # Let's find all occurrences of "category_name":"..."
    # and then find the subcategories and problems following it.
    
    # We'll unescape once at the start to make regex easier
    content = content.replace('\\"', '"').replace('\\/', '/')
    
    # Find all categories
    cat_matches = list(re.finditer(r'"category_name":"(.*?)"', content))
    print(f"Found {len(cat_matches)} categories")
    
    all_problems = []
    global_order = 0
    seen_ids = set()
    
    for i in range(len(cat_matches)):
        cat_name = cat_matches[i].group(1)
        start = cat_matches[i].start()
        end = cat_matches[i+1].start() if i+1 < len(cat_matches) else len(content)
        
        cat_chunk = content[start:end]
        
        # Find subcategories in this chunk
        sub_matches = list(re.finditer(r'"subcategory_name":"(.*?)"', cat_chunk))
        
        for j in range(len(sub_matches)):
            sub_name = sub_matches[j].group(1)
            sub_start = sub_matches[j].start()
            sub_end = sub_matches[j+1].start() if j+1 < len(sub_matches) else len(cat_chunk)
            
            sub_chunk = cat_chunk[sub_start:sub_end]
            
            # Find problems in this sub_chunk
            # Looking for {"problem_id":"...", ...}
            # We match the minimum required fields, assuming they are always there.
            prob_pattern = r'\{"problem_id":".*?","problem_name":".*?".*?\}'
            probs = re.findall(prob_pattern, sub_chunk)
            
            for p_str in probs:
                try:
                    # Clean the string for json.loads if there are trailing tags
                    # Sometimes the regex might grab too much if } is inside string
                    # But usually "}" is the end of the object.
                    
                    p = json.loads(p_str)
                    pid = p['problem_id']
                    
                    if pid and pid not in seen_ids:
                        seen_ids.add(pid)
                        global_order += 1
                        
                        title = p['problem_name']
                        yt = p.get('youtube')
                        lc = p.get('leetcode')
                        art = p.get('article')
                        diff = p.get('difficulty', 'Easy')
                        
                        url = lc if (lc and lc != '$undefined' and lc != '') else art
                        yt_url = yt if (yt and yt != '$undefined' and yt != '') else None
                        
                        all_problems.append({
                            'title': title,
                            'url': url,
                            'yt_url': yt_url,
                            'difficulty': diff,
                            'section': cat_name,
                            'pattern': sub_name,
                            'problemId': int(pid) if pid.isdigit() else 0,
                            'slug': title.lower().replace(' ', '-').replace('/', '-'),
                            'sheet': 'Striver A2Z',
                            'orderIndex': global_order
                        })
                except:
                    continue

    print(f"Total Unique Problems Scraped: {len(all_problems)}")
    
    if len(all_problems) > 0:
        with open('striver_a2z_final.json', 'w', encoding='utf-8') as f:
            json.dump(all_problems, f, indent=2)
            print("Successfully updated striver_a2z_final.json")

if __name__ == "__main__":
    extract_all()

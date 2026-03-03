import re
import json

def dechunk_and_scrape():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Next.js 13/14/15 App Router streaming data format
    # It looks like self.__next_f.push([1, "chunk"])
    # We want to extract and combine all the chunks.
    
    chunks = re.findall(r'self\.__next_f\.push\(\[\d+,\s*"(.*?)"\]\)', html)
    if not chunks:
        # Try without self.
        chunks = re.findall(r'__next_f\.push\(\[\d+,\s*"(.*?)"\]\)', html)
        
    combined = "".join(chunks)
    
    # The combined string has escaped quotes and backslashes
    # We need to handle double backslashes which Next.js uses for the serialized JSON
    # It's essentially a JSON string inside a JS string
    
    # First, let's look for our target markers in the combined string
    # We need to unescape manually because it's double escaped
    combined = combined.replace('\\"', '"').replace('\\\\', '\\')
    
    # Now that we have a more complete string, let's run the category/subcategory logic
    
    # Find all categories
    cat_matches = list(re.finditer(r'"category_name":"(.*?)"', combined))
    print(f"Found {len(cat_matches)} categories in de-chunked data")
    
    all_problems = []
    global_order = 0
    seen_ids = set()
    
    for i in range(len(cat_matches)):
        cat_name = cat_matches[i].group(1)
        start = cat_matches[i].start()
        end = cat_matches[i+1].start() if i+1 < len(cat_matches) else len(combined)
        
        cat_chunk = combined[start:end]
        sub_matches = list(re.finditer(r'"subcategory_name":"(.*?)"', cat_chunk))
        
        for j in range(len(sub_matches)):
            sub_name = sub_matches[j].group(1)
            sub_start = sub_matches[j].start()
            sub_end = sub_matches[j+1].start() if j+1 < len(sub_matches) else len(cat_chunk)
            
            sub_chunk = cat_chunk[sub_start:sub_end]
            
            # Use a more flexible problem regex
            prob_pattern = r'\{"problem_id":".*?","problem_name":".*?".*?\}'
            probs = re.findall(prob_pattern, sub_chunk)
            
            for p_str in probs:
                try:
                    p = json.loads(p_str)
                    pid = str(p['problem_id'])
                    
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
    
    # If still missing, let's check for "Independent" problems
    if len(all_problems) < 450:
        print("Still fewer than 450. Checking for globally missed problems...")
        all_ids = set(re.findall(r'"problem_id":"(\d+)"', combined))
        missing_ids = all_ids - seen_ids
        print(f"Globally missing from hierarchy: {len(missing_ids)}")
        
        # We can try to find them and assign to "Miscellaneous" or find their owner
        # But usually they belong to something.
        
    if len(all_problems) > 0:
        with open('striver_a2z_final.json', 'w', encoding='utf-8') as f:
            json.dump(all_problems, f, indent=2)
            print("Successfully updated striver_a2z_final.json")

if __name__ == "__main__":
    dechunk_and_scrape()

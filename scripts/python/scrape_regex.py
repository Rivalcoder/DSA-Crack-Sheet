import re
import json

def extract_with_regex():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Unescape common characters
    content = content.replace('\\"', '"').replace('\\/', '/')
    
    # Find all categories (Steps)
    categories = list(re.finditer(r'"category_name":"(.*?)"', content))
    
    all_problems = []
    global_order = 0
    
    for i in range(len(categories)):
        cat_name = categories[i].group(1)
        start_pos = categories[i].start()
        end_pos = categories[i+1].start() if i+1 < len(categories) else len(content)
        
        cat_content = content[start_pos:end_pos]
        subcategories = list(re.finditer(r'"subcategory_name":"(.*?)"', cat_content))
        
        for j in range(len(subcategories)):
            sub_name = subcategories[j].group(1)
            sub_start = subcategories[j].start()
            sub_end = subcategories[j+1].start() if j+1 < len(subcategories) else len(cat_content)
            
            sub_content = cat_content[sub_start:sub_end]
            
            # Match problem objects
            problems = re.findall(r'\{"problem_id":".*?","problem_name":".*?","article":".*?","youtube":".*?","leetcode":".*?","plus":".*?","editorial":".*?","link":".*?","difficulty":".*?"\}', sub_content)
            
            for p_str in problems:
                try:
                    p = json.loads(p_str)
                    slug = p['problem_name'].lower().replace(' ', '-').replace('/', '-')
                    url = p['leetcode'] if p['leetcode'] != '$undefined' else p['article']
                    yt_url = p.get('youtube') if p.get('youtube') != '$undefined' else None
                    
                    global_order += 1
                    all_problems.append({
                        'title': p['problem_name'],
                        'url': url,
                        'yt_url': yt_url,
                        'difficulty': p['difficulty'],
                        'section': cat_name,
                        'pattern': sub_name,
                        'problemId': int(p['problem_id']) if p['problem_id'].isdigit() else 0,
                        'slug': slug,
                        'sheet': 'Striver A2Z',
                        'orderIndex': global_order
                    })
                except Exception as e:
                    print(f"Error parsing problem: {e}")
                    continue

    print(f"Extracted {len(all_problems)} problems")
    with open('striver_a2z_final.json', 'w', encoding='utf-8') as f:
        json.dump(all_problems, f, indent=2)

if __name__ == "__main__":
    extract_with_regex()

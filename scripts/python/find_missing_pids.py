import re
import json

def find_missing():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('\\"', '"')
    
    html_ids = set(re.findall(r'"problem_id":"(\d+)"', content))
    
    with open('striver_a2z_final.json', 'r', encoding='utf-8') as f:
        scraped_data = json.load(f)
    scraped_ids = set(str(p['problemId']) for p in scraped_data)
    
    missing = html_ids - scraped_ids
    print(f"Missing {len(missing)} IDs.")
    
    if missing:
        sample_id = list(missing)[0]
        print(f"Sample Missing ID: {sample_id}")
        
        # Find context of this ID in HTML
        match = re.search(r'\{[^{}]*?"problem_id":"' + sample_id + r'".*?\}', content)
        if match:
            print(f"Context: {match.group(0)}")
            
            # Find closest category name BEFORE this match
            before_content = content[:match.start()]
            cat_match = list(re.finditer(r'"category_name":"(.*?)"', before_content))
            if cat_match:
                print(f"Last Category: {cat_match[-1].group(1)}")
            
            sub_match = list(re.finditer(r'"subcategory_name":"(.*?)"', before_content))
            if sub_match:
                print(f"Last Subcategory: {sub_match[-1].group(1)}")

if __name__ == "__main__":
    find_missing()

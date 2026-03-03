import re
import json

def extract_all_data():
    try:
        with open('striver_sheet.html', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Try both escaped and unescaped
        start_idx = content.find('\\"sections\\":[')
        if start_idx == -1:
            start_idx = content.find('"sections":[')
            
        if start_idx == -1:
            print("Could not find sections list.")
            return

        # Find the end by balancing brackets, but careful with escaped brackets if they exist
        # Actually, let's just grab a very large chunk and clean it.
        # Based on search_text, it's roughly at 30k. The whole file is 390k.
        # Let's grab everything from start_idx to the end and try to parse.
        
        # A better way: find the start of the JSON object that contains "sections"
        # It seems to be part of a large string.
        
        # Let's try to find the start of the string.
        # It looks like: ["..."] or similar in Next.js/React streaming format.
        
        # Let's use regex to find a large JSON-like blob.
        # Or just find the first '{' before "sections" and the last '}' after.
        
        actual_start = content.rfind('{', 0, start_idx)
        # Find balanced end from actual_start
        bracket_count = 0
        end_idx = -1
        for i in range(actual_start, len(content)):
            if content[i] == '{':
                bracket_count += 1
            elif content[i] == '}':
                bracket_count -= 1
                if bracket_count == 0:
                    end_idx = i + 1
                    break
        
        if end_idx != -1:
            raw_blob = content[actual_start:end_idx]
            # If it has escaped quotes, unescape them
            if '\\"' in raw_blob:
                # This is tricky because it might be a double escaped string.
                # Let's try to unescape it manually or using json.loads on the whole thing if it's a string.
                try:
                    # If it's a JSON string, it might be wrapped in quotes
                    # But it looks like it's just raw with escapes.
                    # Let's try to unescape by replacing \" with "
                    cleaned = raw_blob.replace('\\"', '"').replace('\\\\', '\\')
                    data = json.loads(cleaned)
                except:
                    # Maybe it's a JS string literal?
                    # Let's try to eval-like approach (not safe, but we are in a script)
                    # Actually let's just use string replacement and hope for the best.
                    print("Failed standard load, trying more cleaning...")
                    cleaned = raw_blob.replace('\\"', '"').replace('\\/', '/')
                    data = json.loads(cleaned)
            else:
                data = json.loads(raw_blob)
                
            with open('striver_a2z_raw.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            
            # Process
            processed = []
            sections = data.get('sections', [])
            if not sections:
                # Maybe it's under 'props' or something
                # We saw Category list in the search_text
                pass # Already handled if it loaded correctly
            
            for step in data.get('sections', []):
                step_name = step.get('category_name', 'Unknown Step')
                for sub in step.get('subcategories', []):
                    sub_name = sub.get('subcategory_name', 'Unknown Section')
                    for prob in sub.get('problems', []):
                        # Construct a problem ID if leetcode is missing
                        slug = prob.get('problem_name', '').lower().replace(' ', '-')
                        url = prob.get('leetcode')
                        if not url or url == '$undefined':
                            url = prob.get('article', f"https://takeuforward.org/problems/{slug}")
                        
                        processed.append({
                            'title': prob.get('problem_name'),
                            'url': url,
                            'difficulty': prob.get('difficulty', 'Medium'),
                            'section': step_name, # Striver "Step" matches our "Section"
                            'pattern': sub_name,  # Striver "Section" matches our "Pattern"
                            'problemId': int(prob.get('problem_id', 0)) if str(prob.get('problem_id', '0')).isdigit() else 0,
                            'slug': slug
                        })
            
            with open('striver_a2z_processed.json', 'w', encoding='utf-8') as f:
                json.dump(processed, f, indent=2)
            print(f"Processed {len(processed)} problems into striver_a2z_processed.json")
        else:
            print("Could not find end of JSON blob.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_all_data()

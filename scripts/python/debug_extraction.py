import re
import json

def debug_extraction():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try a more flexible regex for the problem objects
    # This matches anything starting with {"problem_id" and ending with }
    # but not crossing into another problem_id
    problem_pattern = r'\{"problem_id":".*?"(?:[^{}]|\{[^{}]*\})*?\}'
    
    all_raw_matches = re.findall(problem_pattern, content)
    print(f"Flexible regex found: {len(all_raw_matches)} potential problems")
    
    # Let's see some of them
    for i, match in enumerate(all_raw_matches[:5]):
        print(f"Match {i}: {match[:100]}...")

    # Count how many have "problem_id"
    count = 0
    valid_problems = []
    for match in all_raw_matches:
        if '"problem_id"' in match:
            count += 1
            # Try to fix internal quotes if they broke things
            # The takeuforward HTML often has "problem_name":"String with \" quotes"
            # Our regex might be okay but json.loads might fail if not unescaped
            try:
                # We need to be careful with the double escaping in the HTML
                # The data is often in a string like "data":"[{\"problem_id\":\"...\"}]"
                # so it's already escaped.
                
                # Let's try to unescape it if it looks like it's inside another string
                processed = match.replace('\\"', '"').replace('\\/', '/')
                # Sometimes there's double backslashes in the original HTML before the browser parses it
                
                p = json.loads(processed)
                valid_problems.append(p)
            except Exception as e:
                # If json.loads fails, maybe we can extract fields manually
                title_match = re.search(r'"problem_name":"(.*?)"', processed)
                pid_match = re.search(r'"problem_id":"(.*?)"', processed)
                if title_match and pid_match:
                    valid_problems.append({
                        "problem_id": pid_match.group(1),
                        "problem_name": title_match.group(1),
                        "leetcode": re.search(r'"leetcode":"(.*?)"', processed).group(1) if '"leetcode"' in processed else None,
                        "article": re.search(r'"article":"(.*?)"', processed).group(1) if '"article"' in processed else None,
                        "youtube": re.search(r'"youtube":"(.*?)"', processed).group(1) if '"youtube"' in processed else None,
                        "difficulty": re.search(r'"difficulty":"(.*?)"', processed).group(1) if '"difficulty"' in processed else None,
                    })

    print(f"Total problems identified: {len(valid_problems)}")

if __name__ == "__main__":
    debug_extraction()

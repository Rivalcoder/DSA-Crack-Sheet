import re

def find_urls():
    try:
        with open('striver_sheet.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        lc_urls = re.findall(r'https?://leetcode\.com/problems/[a-zA-Z0-9-]+/?', content)
        gfg_urls = re.findall(r'https?://www\.geeksforgeeks\.org/problems/[a-zA-Z0-9-]+/?', content)
        
        print(f"Found {len(lc_urls)} LeetCode URLs")
        print(f"Found {len(gfg_urls)} GFG URLs")
        
        # Unique URLs
        lc_urls = sorted(list(set(lc_urls)))
        gfg_urls = sorted(list(set(gfg_urls)))
        
        print(f"Unique LeetCode: {len(lc_urls)}")
        print(f"Unique GFG: {len(gfg_urls)}")
        
        with open('extracted_urls.txt', 'w') as f:
            f.write("LeetCode URLs:\n")
            f.write("\n".join(lc_urls))
            f.write("\n\nGFG URLs:\n")
            f.write("\n".join(gfg_urls))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_urls()

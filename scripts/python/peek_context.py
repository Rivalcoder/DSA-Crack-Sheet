import re

def peek_context():
    try:
        with open('striver_sheet.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find first leetcode url position
        match = re.search(r'https?://leetcode\.com/problems/[a-zA-Z0-9-]+/?', content)
        if match:
            start = max(0, match.start() - 500)
            end = min(len(content), match.end() + 500)
            print("Context around first URL:")
            print(content[start:end])
        else:
            print("No URL found")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    peek_context()

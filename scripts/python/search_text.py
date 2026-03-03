import re

def search_text():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    query = "Learn the basics"
    idx = content.find(query)
    if idx != -1:
        print(f"Found '{query}' at {idx}")
        print(content[idx-100:idx+500])
    else:
        print(f"'{query}' not found")

if __name__ == "__main__":
    search_text()

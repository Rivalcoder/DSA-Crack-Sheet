import re
import json

def list_cats():
    with open('striver_sheet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('\\"', '"')
    cats = re.findall(r'"category_name":"(.*?)"', content)
    unique_cats = []
    for c in cats:
        if c not in unique_cats:
            unique_cats.append(c)
    print("Unique Categories found:")
    for c in unique_cats:
        print(f"- {c}")

if __name__ == "__main__":
    list_cats()

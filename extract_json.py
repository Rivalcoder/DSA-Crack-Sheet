import json
import re

def extract_json():
    try:
        with open('striver_sheet.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for __NEXT_DATA__
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', content)
        if match:
            json_str = match.group(1)
            data = json.loads(json_str)
            with open('striver_data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print("Extracted __NEXT_DATA__ to striver_data.json")
            return
        
        # Look for any large JSON blob in a script tag if __NEXT_DATA__ not found
        # Or look for window.__INITIAL_STATE__
        match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(.*?);</script>', content)
        if match:
            json_str = match.group(1)
            # This might need some cleaning if it's not pure JSON
            print("Found window.__INITIAL_STATE__")
            # For now just save it
            with open('striver_data_initial.json', 'w', encoding='utf-8') as f:
                f.write(json_str)
            return

        print("No __NEXT_DATA__ or __INITIAL_STATE__ found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_json()

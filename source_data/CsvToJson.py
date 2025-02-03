import csv
import json

def process_csv(filename):
    try:
        # Read the CSV file
        with open(filename, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            result = {}

            # Process each row
            for row in csv_reader:
                # Create key by combining Condition and Sub-Condition
                key = row['Condition'].strip()
                if row['Sub-Condition'] and row['Sub-Condition'].strip():
                    # Remove lettering (a., b., etc) and trim
                    import re
                    sub_condition = re.sub(r'^[a-z]\.\s*', '', row['Sub-Condition'].strip(), flags=re.I)
                    key = f"{key} - {sub_condition}"

                # Create the nested structure for contraceptive methods
                result[key.lower()] = {
                    "Cu-IUD": {"I": row['Cu-IUD (I)'] or "", "C": row['Cu-IUD (C)'] or ""},
                    "LNG-IUD": {"I": row['LNG-IUD (I)'] or "", "C": row['LNG-IUD (C)'] or ""},
                    "Implant": {"I": row['Implant (I)'] or "", "C": row['Implant (C)'] or ""},
                    "DMPA": {"I": row['DMPA (I)'] or "", "C": row['DMPA (C)'] or ""},
                    "POP": {"I": row['POP (I)'] or "", "C": row['POP (C)'] or ""},
                    "CHC": {"I": row['CHC (I)'] or "", "C": row['CHC (C)'] or ""}
                }

        # Write to JSON file with proper formatting
        with open('output.json', 'w', encoding='utf-8') as json_file:
            json.dump(result, json_file, indent=2)

        print("JSON file has been created successfully as 'output.json'")

    except Exception as e:
        print(f"Error processing CSV: {str(e)}")

# Run the script
if __name__ == "__main__":
    process_csv('data.csv')

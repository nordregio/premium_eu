import pandas as pd
import json
import os

INPUT_CSV = "data/migration_projections/regional_pop.csv"
OUTPUT_DIR = "data/migration_projections/pyramid_regions"

df = pd.read_csv(INPUT_CSV, sep=";")

# Fix column name (has a colon prefix)
df.columns = [c.strip().lstrip(":") for c in df.columns]

# Fix POPULATION decimal separator (comma -> period) and convert
df["POPULATION"] = df["POPULATION"].astype(str).str.replace(",", ".").astype(float)

# Map AGE to display labels
def age_label(age):
    age = int(age)
    if age >= 85:
        return "85+"
    return f"{age}-{age+4}"

df["age_label"] = df["AGE"].apply(age_label)

# Aggregate: sum POPULATION across EDUC, group by NUTS3, YEAR, SEX, age_label
agg = df.groupby(["NUTS3", "YEAR", "SEX", "AGE", "age_label"])["POPULATION"].sum().reset_index()

os.makedirs(OUTPUT_DIR, exist_ok=True)

count = 0
for nuts3, group in agg.groupby("NUTS3"):
    records = []
    for _, row in group.iterrows():
        records.append({
            "y": int(row["YEAR"]),
            "s": row["SEX"],
            "a": int(row["AGE"]),
            "l": row["age_label"],
            "v": round(row["POPULATION"])
        })
    with open(os.path.join(OUTPUT_DIR, f"{nuts3}.json"), "w") as f:
        json.dump(records, f, separators=(",", ":"))
    count += 1

print(f"Generated {count} pyramid region files in {OUTPUT_DIR}/")

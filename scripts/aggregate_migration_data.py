import pandas as pd
import json
import os

INPUT_CSV = "data/migration_projections/regional_netmig.csv"
OUTPUT_DIR = "data/migration_projections/regions"

df = pd.read_csv(INPUT_CSV, sep=";")

# Aggregate: sum NETMIG by NUTS3, PERIOD, Age4 Group, SEX, EDUC
agg = df.groupby(["NUTS3", "PERIOD", "Age4 Group", "SEX", "EDUC"])["NETMIG"].sum().reset_index()

os.makedirs(OUTPUT_DIR, exist_ok=True)

count = 0
for nuts3, group in agg.groupby("NUTS3"):
    records = []
    for _, row in group.iterrows():
        records.append({
            "p": int(row["PERIOD"]),
            "a": row["Age4 Group"],
            "s": row["SEX"],
            "e": row["EDUC"],
            "v": int(row["NETMIG"])
        })
    with open(os.path.join(OUTPUT_DIR, f"{nuts3}.json"), "w") as f:
        json.dump(records, f, separators=(",", ":"))
    count += 1

print(f"Generated {count} region files in {OUTPUT_DIR}/")

import pandas as pd

df = pd.read_excel("data/migration_perspectives/quotes.xlsx")
df.columns = df.columns.str.strip()

# Define all topic columns
topic_cols = [
    "Social",
    "Economic",
    "Living environment",
    "Discrimination",
    "Education",
    "Housing",
    "Income",
    "Integration",
    "Language barriers",
    "Nature",
    "Pollution",
    "Transportation",
    "Work/employment",
    "Health",
    "Legal barriers",
    "Motivations to migrate",
    "Belonging",
    "Future migration plans",
]
topic_cols = [c for c in topic_cols if c in df.columns]

# Check for duplicate quotes before removing them
duplicate_count = len(df) - df['Quote in English'].nunique()
if duplicate_count > 0:
    print(f"Found {duplicate_count} duplicate quote rows (same text, same metadata)")

# Get unique quotes only (one row per actual quote text)
df_unique = df.drop_duplicates(subset=["Quote in English"]).copy()
print(f"Processing {len(df_unique)} unique quotes")

# Convert topic columns to numeric
df_unique[topic_cols] = df_unique[topic_cols].apply(pd.to_numeric, errors="coerce")

# Get topics for each quote (1 = topic is tagged)
def get_topics(row):
    return [col for col in topic_cols if row[col] > 0]

df_unique["topics"] = df_unique.apply(get_topics, axis=1)

# Define main and additional topics
main_topics = ["Economic", "Social", "Living environment"]
additional_topics = [
    "Discrimination",
    "Education",
    "Housing",
    "Income",
    "Integration",
    "Language barriers",
    "Nature",
    "Pollution",
    "Transportation",
    "Work/employment",
    "Health",
    "Legal barriers",
    "Motivations to migrate",
    "Belonging",
    "Future migration plans",
]


def split_topics(topics):
    """Split topics into main and additional categories"""
    main = [t for t in topics if t in main_topics]
    additional = [t for t in topics if t in additional_topics]
    return (
        ", ".join(main) if main else None,
        ", ".join(additional) if additional else None,
    )


df_unique[["topic_main", "topic_additional"]] = df_unique["topics"].apply(
    lambda x: pd.Series(split_topics(x))
)

# Optional: filter to only quotes with at least one main topic
df_unique = df_unique[df_unique["topic_main"].notna()]

# Rename columns and select final output columns
df_final = df_unique.rename(
    columns={
        "Quote in English": "quote",
        "Interview location": "interview_location",
        "Migration type": "migration_type",
        "Age group": "age_group",
        "Country of birth": "birth_location",
        "Gender": "gender",
    }
)[
    [
        "quote",
        "topic_main",
        "topic_additional",
        "interview_location",
        "migration_type",
        "age_group",
        "birth_location",
        "gender",
    ]
]

# Remove newlines from quotes (collapse multi-line quotes into single line)
df_final["quote"] = df_final["quote"].str.replace("\n", " ", regex=False).str.replace("\r", " ", regex=False)
# Clean up multiple spaces
df_final["quote"] = df_final["quote"].str.replace(r"\s+", " ", regex=True).str.strip()

# Clean up birth_location
df_final["birth_location"] = (
    df_final["birth_location"]
    .astype(str)
    .str.replace("\t", " ", regex=False)  # fix "The<TAB>Netherlands"
    .str.replace("T�rkiye", "Türkiye", regex=False)
    .str.replace("Türkiye", "Turkey", regex=False)
)

# Clean up interview_location
df_final["interview_location"] = (
    df_final["interview_location"]
    .astype(str)
    .str.replace("Türkiye", "Turkey", regex=False)
)

# Capitalize gender values
df_final["gender"] = df_final["gender"].str.capitalize()

# Save to CSV
df_final.to_csv("data/migration_perspectives/quotes.csv", index=False)

print("Done!")
print(f"Output saved to: data/migration_perspectives/quotes.csv")
print(f"Total rows: {len(df_final)}")
print(f"Filtered out quotes with no main topic assigned")

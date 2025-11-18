import pandas as pd

df = pd.read_excel("data/migration_perspectives/quotes.xlsx")

df.columns = df.columns.str.strip()

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

df[topic_cols] = df[topic_cols].apply(pd.to_numeric, errors="coerce")

df_long = df.melt(
    id_vars=[
        "Interview id",
        "Quotation id",
        "Gender",
        "Age group",
        "Migration type",
        "Country of birth",
        "Interview location",
        "Quote in English",
    ],
    value_vars=topic_cols,
    var_name="topic",
    value_name="value",
)

df_long = df_long[df_long["value"] > 0]

df_grouped = (
    df_long.groupby(
        [
            "Interview id",
            "Quotation id",
            "Gender",
            "Age group",
            "Migration type",
            "Country of birth",
            "Interview location",
            "Quote in English",
        ]
    )["topic"]
    .apply(list)
    .reset_index()
)

df_grouped["topic"] = df_grouped["topic"].apply(lambda lst: list(dict.fromkeys(lst)))

# Main + additional topic definitions
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
    main = [t for t in topics if t in main_topics]
    additional = [t for t in topics if t in additional_topics]
    return (
        ", ".join(main) if main else None,
        ", ".join(additional) if additional else None,
    )


df_grouped[["topic_main", "topic_additional"]] = df_grouped["topic"].apply(
    lambda x: pd.Series(split_topics(x))
)

df_grouped = df_grouped[df_grouped["topic_main"].notna()]

df_grouped = df_grouped[df_grouped["Interview location"] != "Spain"]

df_final = df_grouped.rename(
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

df_final["birth_location"] = (
    df_final["birth_location"]
    .astype(str)
    .str.replace("\t", " ", regex=False)  # fix “The<TAB>Netherlands”
    .str.replace("T�rkiye", "Türkiye", regex=False)
    .str.replace("Türkiye", "Turkey", regex=False)
)


df_final["interview_location"] = (
    df_final["interview_location"]
    .astype(str)
    .str.replace("Türkiye", "Turkey", regex=False)
)

df_final["gender"] = df_final["gender"].str.capitalize()

unwanted_phrases = [
    "farming thing",
    "cried all summer",
    "yes liquorice",
    "place is over.",
    "quite an intelligent woman",
]

pattern = "|".join(unwanted_phrases)

df_final = df_final[
    ~df_final.astype(str)
    .apply(lambda row: row.str.contains(pattern, case=False, na=False))
    .any(axis=1)
]

df_final.to_csv("data/migration_perspectives/quotes.csv", index=False)

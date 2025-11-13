import pandas as pd
import ast

df = pd.read_excel("data/regional_policies/cleaned_policies.xlsx")


def to_list(value):
    if isinstance(value, str):
        try:
            return ast.literal_eval(value)
        except:
            return [v.strip() for v in value.split(",")]
    return value


df["nuts_codes"] = df["applicable_regions"].apply(to_list)
df["policy_tags"] = df["dashboard_tags"].apply(
    lambda x: [t.strip() for t in x.split(",")] if isinstance(x, str) else x
)
df["policy_summary"] = df["Summary_50_words"]
df["policy_description"] = df["Summary_200_words"]
df["region_origin"] = df["source_region"]
df["links"] = df["Link"]
df["scope"] = df["Scope"]
df["origin"] = df["Origin"]
df["origin"] = (
    df["origin"]
    .astype(str)
    .str.encode("utf-8", "ignore")
    .str.decode("utf-8")
    .str.replace(r"[^\x00-\x7F]+", "", regex=True)
    .str.strip()
)
df["policy_tags"] = df["policy_tags"].apply(
    lambda tags: [
        t.replace("_", " ").capitalize() if isinstance(t, str) else t for t in tags
    ]
)


def normalize_scope(value):
    if not isinstance(value, str):
        return None
    value = value.strip().lower()
    if "policy" in value:
        return "Policy"
    elif "programme" in value or "program" in value:
        return "Programme"
    return None


df["scope"] = df["scope"].apply(normalize_scope)


final_df = df[
    [
        "nuts_codes",
        "policy_tags",
        "policy_summary",
        "policy_description",
        "region_origin",
        "links",
        "scope",
        "origin",
    ]
]

final_df.to_csv("data/regional_policies/policies.csv", index=False)

import json
import geopandas as gpd
import pandas as pd
from collections import defaultdict
import os
import numpy as np

def create_regions_json():
    """Convert region data to JSON"""
    gdf = gpd.read_file("data/NUTS/NUTS_RG_01M_2021_4326.geojson")
    df = gdf[["LEVL_CODE", "CNTR_CODE", "NAME_LATN", "NUTS_ID"]]
    df = df[df["LEVL_CODE"].isin([0, 3])]

    countries_df = df[df["LEVL_CODE"] == 0][["CNTR_CODE", "NAME_LATN"]].rename(
        columns={"NAME_LATN": "COUNTRY_NAME"}
    )
    regions_df = df[df["LEVL_CODE"] == 3]

    df = regions_df.merge(countries_df, on="CNTR_CODE", how="left")

    region_map = defaultdict(list)
    for _, row in df.iterrows():
        region_map[row["CNTR_CODE"]].append([row["NUTS_ID"], row["NAME_LATN"]])

    # Convert defaultdict to regular dict for JSON serialization
    region_data = dict(region_map)

    with open('static/data/regions.json', 'w', encoding='utf-8') as f:
        json.dump(region_data, f, ensure_ascii=False, indent=2)

    print("Created static/data/regions.json")

def create_development_tags_json():
    """Convert development tags to JSON"""
    try:
        df = pd.read_csv("data/regional_development/dashboard_typologies.csv")
        tag_data = df.set_index("NUTS_Code").to_dict("index")

        with open('static/data/development_tags.json', 'w', encoding='utf-8') as f:
            json.dump(tag_data, f, ensure_ascii=False, indent=2)

        print("Created static/data/development_tags.json")
    except FileNotFoundError:
        print("Warning: data/regional_development/dashboard_typologies.csv not found")

def create_migration_tags_json():
    """Convert migration tags to JSON"""
    try:
        df = pd.read_excel("data/regional_migration/migr_tab_tags.xlsx")
        df = df.replace({np.nan: None})
        tag_data = df.set_index("NUTS_Code").to_dict("index")

        with open('static/data/migration_tags.json', 'w', encoding='utf-8') as f:
            json.dump(tag_data, f, ensure_ascii=False, indent=2)
        print("Created static/data/migration_tags.json")
    except FileNotFoundError:
        print("Warning: data/regional_migration/dashboard_typologies.csv not found")

def create_region_scores_json():
    """Convert region scores to JSON"""
    try:
        df = pd.read_csv("data/regional_development/development_scores.csv")
        latest_year = df["Year"].max()
        df = df[df["Year"] == latest_year]
        score_data = df.set_index("NUTS_Code").to_dict("index")

        with open('static/data/region_scores.json', 'w', encoding='utf-8') as f:
            json.dump(score_data, f, ensure_ascii=False, indent=2)

        print("Created static/data/region_scores.json")
    except FileNotFoundError:
        print("Warning: data/regional_development/development_scores.csv not found")

def create_trend_scores_json():
    """Convert regional development trend scores from XLSX to JSON"""
    try:
        df = pd.read_excel("data/regional_development/trends.xlsx")

        # Create a dictionary with NUTS_Code as key
        trend_data = {}
        for _, row in df.iterrows():
            nuts_code = row['NUTS_Code']
            trend_data[nuts_code] = {
                'trend_devel_score': row['trend_devel_score'],
                'trend_econ_index': row['trend_econ_index'],
                'trend_social_index': row['trend_social_index'],
                'trend_liv_env_index': row['trend_liv_env_index']
            }

        with open("static/data/region_trends.json", 'w', encoding='utf-8') as f:
            json.dump(trend_data, f, ensure_ascii=False, indent=2)

        print(f"Created {"static/data/region_trends.json"} with {len(trend_data)} regions")

    except FileNotFoundError:
        print(f"Error: {"data/regional_development/development_trends.xlsx"} not found")
    except Exception as e:
        print(f"Error: {e}")

def create_strengths_weaknesses_json():
    """Convert strengths/weaknesses to JSON"""
    try:
        df = pd.read_excel("data/regional_development/region_strengths_and_weaknesses.xlsx")
        data = df.set_index("NUTS_Code").to_dict("index")

        with open('static/data/strengths_weaknesses.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("Created static/data/strengths_weaknesses.json")
    except FileNotFoundError:
        print("Warning: data/regional_development/strengths_weaknesses.csv not found")

def create_migration_type_descriptions():
    """Convert strengths/weaknesses to JSON"""
    try:
        df = pd.read_excel("data/regional_migration/migr_tab_text.xlsx")
        df = df.replace({np.nan: None})

        data = df.set_index("NUTS_Code").to_dict("index")

        with open('static/data/migration_type_descriptions.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("Created static/data/migration_type_descriptions.json")
    except FileNotFoundError:
        print("Warning: data/regional_migration/migr_tab_text.xlsx not found")


def create_comparisons_json():
    try:
        df = pd.read_csv("data/regional_development/national_comparison_text.csv")

        # Create a dictionary with NUTS_Code as key
        comparisons_data = {}
        for _, row in df.iterrows():
            nuts_code = row['NUTS_Code']
            comparisons_data[nuts_code] = {
                'overall_status_txt': row['overall_status_txt'],
                'country_compare_txt': row['country_compare_txt']
            }

        with open("static/data/national_comparisons.json", 'w', encoding='utf-8') as f:
            json.dump(comparisons_data, f, ensure_ascii=False, indent=2)

        print(f"Created {"static/data/national_comparisons.json"} with {len(comparisons_data)} regions")

    except FileNotFoundError:
        print(f"Error: {"data/regional_development/national_comparison_text.csv"} not found")
    except Exception as e:
        print(f"Error: {e}")



def main():
    os.makedirs('data', exist_ok=True)

    print("Converting Flask data to static JSON files...\n")

    create_regions_json()
    create_development_tags_json()
    create_migration_tags_json()
    create_region_scores_json()
    create_trend_scores_json()
    create_strengths_weaknesses_json()
    create_comparisons_json()
    create_migration_type_descriptions()

    print(f"\n Data conversion complete!")
    print(f"Files created in 'data/' directory")

    # Check for policy CSV
    if os.path.exists("data/regional_policies/policies.csv"):
        print(f"Policy CSV file found - no conversion needed")
    else:
        print(f"Warning: data/regional_policies/policies.csv not found")

if __name__ == "__main__":
    main()

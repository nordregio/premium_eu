import { parseCSVLine, parseArrayField } from '../shared/csvParser.js';

async function loadPolicyData() {
  try {
    const response = await fetch('data/regional_policies/policies.csv');
    const csvText = await response.text();

    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line);

      if (values.length >= 8) {
        const policy = {
          nuts_codes: parseArrayField(values[0]),
          policy_tags: parseArrayField(values[1]),
          policy_summary: values[2].replace(/"/g, '').trim(),
          policy_description: values[3].replace(/"/g, '').trim(),
          region_origin: parseArrayField(values[4]),
          links: values[5].replace(/"/g, '').trim(),
          scope: values[6] ? values[6].replace(/"/g, '').trim() : '',
          origin: values[7] ? values[7].replace(/"/g, '').trim() : ''
        };
        data.push(policy);
      }
    }

    console.log(`Loaded ${data.length} policies from CSV`);
    return data;
  } catch (error) {
    console.error('Error loading policy data:', error);
    return [];
  }
}

export async function loadAllData() {
  try {
    const [
      regionResponse,
      devTagsResponse,
      migTagsResponse,
      scoresResponse,
      trendsResponse,
      strengthsResponse,
      comparisonsResponse,
      typeDescResponse,
      regionGroupsResponse
    ] = await Promise.all([
      fetch('data/regions.json'),
      fetch('data/development_tags.json'),
      fetch('data/migration_tags.json'),
      fetch('data/region_scores.json'),
      fetch('data/region_trends.json'),
      fetch('data/strengths_weaknesses.json'),
      fetch('data/national_comparisons.json'),
      fetch('data/migration_type_descriptions.json'),
      fetch('data/regional_groups.json')
    ]);

    const [
      regionData,
      developmentTagData,
      migrationTagData,
      regionScores,
      regionTrends,
      strengthsWeaknessesData,
      nationalComparisonsData,
      typeDescriptionData,
      regionGroups
    ] = await Promise.all([
      regionResponse.json(),
      devTagsResponse.json(),
      migTagsResponse.json(),
      scoresResponse.json(),
      trendsResponse.json(),
      strengthsResponse.json(),
      comparisonsResponse.json(),
      typeDescResponse.json(),
      regionGroupsResponse.json()
    ]);

    const policyData = await loadPolicyData();

    console.log('All static data loaded successfully');

    return {
      regionData,
      developmentTagData,
      migrationTagData,
      regionScores,
      regionTrends,
      strengthsWeaknessesData,
      nationalComparisonsData,
      typeDescriptionData,
      regionGroups,
      policyData
    };
  } catch (error) {
    console.error('Error loading static data:', error);
    return null;
  }
}

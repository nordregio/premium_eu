import { parseCSVLine, parseArrayField } from '../shared/csvParser.js';

async function loadPolicyData() {
  try {
    const response = await fetch('data/regional_policies/policies.csv');
    if (!response.ok) throw new Error(`Failed to load policies.csv (${response.status})`);
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
    const urls = [
      'data/regions.json',
      'data/development_tags.json',
      'data/migration_tags.json',
      'data/region_scores.json',
      'data/region_trends.json',
      'data/strengths_weaknesses.json',
      'data/national_comparisons.json',
      'data/migration_type_descriptions.json',
      'data/regional_groups.json'
    ];

    const responses = await Promise.all(urls.map(url => fetch(url)));

    const failed = responses.filter(r => !r.ok);
    if (failed.length > 0) {
      throw new Error(`Failed to load: ${failed.map(r => `${r.url} (${r.status})`).join(', ')}`);
    }

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
    ] = await Promise.all(responses.map(r => r.json()));

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

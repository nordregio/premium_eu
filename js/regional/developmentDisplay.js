export function loadRegionalDevelopmentData(regionCode, data) {
  const intro = document.getElementById('development-intro');
  if (intro) intro.style.display = 'block';

  loadDevelopmentTags(regionCode, data.developmentTagData);
  loadDevelopmentScores(regionCode, data.regionScores, data.regionTrends);
  loadStrengthsWeaknesses(regionCode, data.strengthsWeaknessesData);
  loadNationalComparisons(regionCode, data.nationalComparisonsData);
  loadDevelopmentPlot(regionCode);
}

export function loadDevelopmentTags(regionCode, tagData) {
  const container = document.getElementById('regional_development_tags');
  const tags = tagData[regionCode];

  if (!tags) {
    container.innerHTML = '<p></p>';
    return;
  }

  let html = '<div class="regional_development_tags">';
  ['urban_type', 'devel_status_type', 'devel_trend_type',].forEach(key => {
    const tagValue = tags[key];
    if (tagValue) {
      html += `<button>${tagValue}</button>`;
    }
  });
  html += '</div>';

  container.innerHTML = html;
}

export function loadDevelopmentScores(regionCode, scores, trends) {
  const container = document.getElementById('regional_development_scores');
  const data = scores[regionCode];
  const regionTrends = trends[regionCode];

  if (!data) {
    container.innerHTML = '<p>No data available.</p>';
    return;
  }

  const formatScore = (val) => `${Math.round(val * 10)}/10`;

  const getTrendIndicator = (trend) => {
    if (!trend) return '';
    const isImproving = trend === 'Improving';
    const arrowIcon = isImproving ? '↑' : '↓';
    const color = isImproving ? '#697D61' : '#ac5737';
    return `<span style="color: ${color}; font-weight: 600; margin-left: 8px;">${arrowIcon} ${trend}</span>`;
  };

  const html = `
    <p style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Development scores</p>
    <div class="score-cards">
      <div class="card">
        <h3>Economic</h3>
        <p>${formatScore(data.econ_index)}</p>
        <div style="font-size: 11px; margin-top: 4px;">${getTrendIndicator(regionTrends?.trend_econ_index || '')}</div>
      </div>
      <div class="card">
        <h3>Social</h3>
        <p>${formatScore(data.social_index)}</p>
        <div style="font-size: 11px; margin-top: 4px;">${getTrendIndicator(regionTrends?.trend_social_index || '')}</div>
      </div>
      <div class="card">
        <h3>Living environment</h3>
        <p>${formatScore(data.liv_env_index)}</p>
        <div style="font-size: 11px; margin-top: 4px;">${getTrendIndicator(regionTrends?.trend_liv_env_index || '')}</div>
      </div>
      <div class="card total">
        <h3>Overall</h3>
        <p>${formatScore(data.devel_score)}</p>
        <div style="font-size: 11px; margin-top: 4px; color: white;">${getTrendIndicator(regionTrends?.trend_devel_score || '')}</div>
      </div>
    </div>
    <br>
  `;

  container.innerHTML = html;
}

export function loadStrengthsWeaknesses(regionCode, swData) {
  const container = document.getElementById('strengths_weaknesses');
  const data = swData[regionCode];

  if (!data) {
    container.innerHTML = '<br>';
    return;
  }

  const html = `
    <div class="strengths_weaknesses">
      <p style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Strengths and weaknesses</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.regional_development_status || 'No data available.'}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.regional_development_strengths || 'No data available.'}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.regional_development_weaknesses || 'No data available.'}</p>
      <br>
    </div>
  `;

  container.innerHTML = html;
}

export function loadNationalComparisons(regionCode, compData) {
  const container = document.getElementById('national_comparisons');
  const data = compData[regionCode];

  if (!data) {
    container.innerHTML = '<br>';
    return;
  }

  const html = `
    <div class="national_comparisons">
      <p style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">National comparisons</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.overall_status_txt || 'No data available.'}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.country_compare_txt || 'No data available.'}</p>
      <br>
    </div>
  `;

  container.innerHTML = html;
}

export function loadDevelopmentPlot(regionCode) {
  const container = document.getElementById('regional_development_scores_plot_wrapper');
  const plotPath = `plots/regional-scores/${regionCode}.html`;

  fetch(plotPath)
    .then(response => {
      if (response.ok) {
        const html = `
          <p style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Development scores over time</p>
          <iframe src="${plotPath}" width="100%" height="320" frameborder="0"></iframe>
          <br>
        `;
        container.innerHTML = html;
      } else {
        container.innerHTML = '<p style="color:#999;">No data available for this region.</p>';
      }
    })
    .catch(() => {
      container.innerHTML = '<p style="color:#999;">No data available for this region.</p>';
    });
}

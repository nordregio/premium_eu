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

// --- Development scores plot ---
let devScoresCache = null;

async function fetchDevScores() {
  if (devScoresCache) return devScoresCache;
  const response = await fetch('data/dev-scores/development_scores_all_indicators.csv');
  if (!response.ok) throw new Error('No data');
  const text = await response.text();
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const codeIdx = headers.indexOf('NUTS_Code');
  const yearIdx = headers.indexOf('Year');
  const econIdx = headers.indexOf('econ_index');
  const socialIdx = headers.indexOf('social_index');
  const livIdx = headers.indexOf('liv_env_index');
  const develIdx = headers.indexOf('devel_score');

  const parsed = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const code = cols[codeIdx];
    if (!parsed[code]) parsed[code] = [];
    parsed[code].push({
      year: parseInt(cols[yearIdx]),
      econ: parseFloat(cols[econIdx]),
      social: parseFloat(cols[socialIdx]),
      livEnv: parseFloat(cols[livIdx]),
      devel: parseFloat(cols[develIdx])
    });
  }
  devScoresCache = parsed;
  return parsed;
}

export async function loadDevelopmentPlot(regionCode) {
  const container = document.getElementById('regional_development_scores_plot_wrapper');
  container.innerHTML = '';

  try {
    const allData = await fetchDevScores();
    const regionData = allData[regionCode];
    if (!regionData || regionData.length === 0) {
      container.innerHTML = '<p style="color:#999;">No data available for this region.</p>';
      return;
    }

    regionData.sort((a, b) => a.year - b.year);
    const years = regionData.map(d => d.year);

    container.innerHTML = `
      <p style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Development scores over time</p>
      <div id="dev-scores-plot" style="width:100%"></div>
      <br>
    `;

    const traces = [
      {
        x: years, y: regionData.map(d => d.devel),
        mode: 'lines+markers', name: 'Overall',
        line: { color: '#C97F55' }, marker: { size: 6 }
      },
      {
        x: years, y: regionData.map(d => d.econ),
        mode: 'lines+markers', name: 'Economic',
        line: { color: '#656791' }, marker: { size: 6 }
      },
      {
        x: years, y: regionData.map(d => d.social),
        mode: 'lines+markers', name: 'Social',
        line: { color: '#697D61' }, marker: { size: 6 }
      },
      {
        x: years, y: regionData.map(d => d.livEnv),
        mode: 'lines+markers', name: 'Living environment',
        line: { color: '#826875' }, marker: { size: 6 }
      }
    ];

    const plotDiv = document.getElementById('dev-scores-plot');

    const layout = {
      autosize: true,
      height: 300,
      xaxis: { gridcolor: '#f0f0f0' },
      yaxis: { title: 'Score', tickformat: '.2f', gridcolor: '#f0f0f0' },
      legend: {
        orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center',
        font: { size: 10 }
      },
      font: { family: 'Montserrat, sans-serif', size: 10, color: '#252a53' },
      margin: { l: 40, r: 10, t: 20, b: 30 },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      hovermode: 'x unified'
    };

    Plotly.newPlot(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
  } catch (e) {
    container.innerHTML = '<p style="color:#999;">No data available for this region.</p>';
  }
}

export function resizeDevelopmentPlot() {
  const plotDiv = document.getElementById('dev-scores-plot');
  if (plotDiv && plotDiv.data) {
    Plotly.Plots.resize(plotDiv);
  }
}

// --- Migration projection state ---
const migrationState = {
  regionCode: null,
  data: null,
  breakdownDim: 'age',
  selectedValues: [],
  filters: { age: 'total', sex: 'total', educ: 'total' }
};

const DIMENSIONS = {
  age:  { label: 'Age',       key: 'a', values: ['00-19', '20-39', '40-65', '65+'],  displayLabels: { '00-19': '0-19', '20-39': '20-39', '40-65': '40-65', '65+': '65+' } },
  sex:  { label: 'Gender',    key: 's', values: ['Female', 'Male'],                   displayLabels: { 'Female': 'Female', 'Male': 'Male' } },
  educ: { label: 'Education', key: 'e', values: ['1 Low', '2 Middle', '3 High'],      displayLabels: { '1 Low': 'Low', '2 Middle': 'Middle', '3 High': 'High' } }
};

const LINE_COLORS = {
  '00-19':    '#5B8DBE',
  '20-39':    '#C97F55',
  '40-65':    '#7CAA68',
  '65+':      '#9B6B9E',
  'Female':   '#C97F55',
  'Male':     '#5B8DBE',
  '1 Low':    '#C97F55',
  '2 Middle': '#5B8DBE',
  '3 High':   '#7CAA68',
  'total':    '#C97F55'
};

// --- No-data placeholder ---
function noDataHTML() {
  return `
    <div style="display:flex;align-items:center;justify-content:center;
                height:200px;text-align:center;">
      <div style="font-size:12px;color:#bbb;">No data for this region</div>
    </div>`;
}

function setProjectionHasData(hasData) {
  const controls = document.querySelector('.migration_projections_controls');
  if (controls) controls.style.display = hasData ? '' : 'none';
}

function setPyramidHasData(hasData) {
  const slider = document.querySelector('.slider-container');
  if (slider) slider.style.display = hasData ? '' : 'none';
}

// --- Existing functions (unchanged) ---

export function loadMigrationData(regionCode, data) {
  const intro = document.getElementById('migration-intro');
  if (intro) intro.style.display = 'block';

  loadMigrationTags(regionCode, data.migrationTagData);
  loadMigrationTypeDescription(regionCode, data.typeDescriptionData);
  if (document.getElementById('content-tab3').classList.contains('active')) {
    loadMigrationProjection(regionCode);
    loadMigrationPyramid(regionCode);
  }
}

export function loadMigrationTags(regionCode, tagData) {
  const container = document.getElementById('regional_migration_tags');
  const tags = tagData[regionCode];

  if (!tags) {
    container.innerHTML = '';
    document.getElementById('migration_type_description').innerHTML = '';
    return;
  }

  let html = '<div class="regional_migration_tags">';
  ['pop_growth_tag', 'nat_change_tag', 'migr_tag', 'pop_age_tag', 'age_rate_tag'].forEach(key => {
    const tagValue = tags[key];
    if (tagValue) {
      html += `<button>${tagValue}</button>`;
    }
  });
  html += '</div>';

  container.innerHTML = html;
}

export function loadMigrationTypeDescription(regionCode, descData) {
  const container = document.getElementById('migration_type_description');
  const data = descData[regionCode];

  if (!data) {
    container.innerHTML = '';
    return;
  }

  const html = `
    <div class="migration_type_description">
      <p style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Strengths and weaknesses</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.pop_growth_text || 'No data available.'}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.nat_change_text || ''}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.migr_text || ''}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.pop_age_text || ''}</p>
      <p style="font-size: 12px; margin-bottom: 6px;">${data.age_rate_text || ''}</p>
      <br>
    </div>
  `;

  container.innerHTML = html;
}

// --- Pyramid state ---
let pyramidData = null;
let pyramidRegionCode = null;

const AGE_ORDER = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];

export async function loadMigrationPyramid(regionCode) {
  // Clear immediately
  document.getElementById('pyramid-content').innerHTML = '';
  setPyramidHasData(false);

  // Only re-fetch if region changed
  if (regionCode !== pyramidRegionCode) {
    pyramidRegionCode = regionCode;
    pyramidData = null;
    try {
      const response = await fetch(`data/migration_projections/pyramid_regions/${regionCode}.json`);
      if (!response.ok) throw new Error('No data');
      pyramidData = await response.json();
    } catch (e) {
      pyramidData = null;
    }
  }

  if (!pyramidData) {
    document.getElementById('pyramid-content').innerHTML = noDataHTML();
    return;
  }

  setPyramidHasData(true);
  renderPyramidChart();
}

function renderPyramidChart() {
  const plotDiv = document.getElementById('pyramid-content');
  const year = parseInt(document.getElementById('yearSlider').value);

  const yearData = pyramidData.filter(r => r.y === year);
  if (yearData.length === 0) {
    plotDiv.innerHTML = noDataHTML();
    setPyramidHasData(false);
    return;
  }

  // Build maps for male/female by age
  const maleMap = {};
  const femaleMap = {};
  yearData.forEach(r => {
    if (r.s === 'Male') maleMap[r.a] = r.v;
    else femaleMap[r.a] = r.v;
  });

  const labels = AGE_ORDER.map(a => a >= 85 ? '85+' : `${a}-${a + 4}`);
  const maleVals = AGE_ORDER.map(a => maleMap[a] || 0);
  const femaleVals = AGE_ORDER.map(a => femaleMap[a] || 0);

  const maxVal = Math.max(...maleVals, ...femaleVals);
  const tickMax = Math.ceil(maxVal / 1000) * 1000;
  const tickStep = Math.max(1000, Math.round(tickMax / 4 / 500) * 500);

  const tickVals = [];
  for (let t = -tickMax; t <= tickMax; t += tickStep) {
    tickVals.push(t);
  }

  const traces = [
    {
      y: labels,
      x: maleVals.map(v => -v),
      name: 'Male',
      type: 'bar',
      orientation: 'h',
      marker: { color: '#5B8DBE' },
      customdata: maleVals,
      hovertemplate: 'Age: %{y}<br>Population: %{customdata:,.0f}<extra>Male</extra>'
    },
    {
      y: labels,
      x: femaleVals,
      name: 'Female',
      type: 'bar',
      orientation: 'h',
      marker: { color: '#C97F55' },
      hovertemplate: 'Age: %{y}<br>Population: %{x:,.0f}<extra>Female</extra>'
    }
  ];

  const layout = {
    barmode: 'relative',
    bargap: 0.1,
    bargroupgap: 0,
    xaxis: {
      title: 'Population',
      tickvals: tickVals,
      ticktext: tickVals.map(v => Math.abs(v).toLocaleString()),
      gridcolor: '#f0f0f0'
    },
    yaxis: {
      title: 'Age group',
      categoryorder: 'array',
      categoryarray: labels
    },
    legend: { x: 0.01, y: 0.95, font: { size: 10 } },
    margin: { l: 50, r: 10, t: 10, b: 40 },
    height: 340,
    font: { family: 'Montserrat, sans-serif', size: 10, color: '#252a53' },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    hovermode: 'closest'
  };

  Plotly.newPlot(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
}

export function showMigrationSections() {
  const projectionSection = document.getElementById('migration-projection');
  const pyramidSection = document.getElementById('migration-pyramid');
  if (projectionSection) projectionSection.classList.add('show');
  if (pyramidSection) pyramidSection.classList.add('show');
}

export function hideMigrationSections() {
  const projectionSection = document.getElementById('migration-projection');
  const pyramidSection = document.getElementById('migration-pyramid');
  if (projectionSection) projectionSection.classList.remove('show');
  if (pyramidSection) pyramidSection.classList.remove('show');
}

export function updateYear() {
  const slider = document.getElementById('yearSlider');
  const yearValue = document.getElementById('yearValue');
  if (slider && yearValue) {
    yearValue.textContent = slider.value;
  }
}

export function updatePyramid() {
  // intentionally empty - matches original behavior
}

// --- New projection functions ---

export function initMigrationControls() {
  document.querySelectorAll('.migration-breakby-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      migrationState.breakdownDim = btn.dataset.dim;
      if (btn.dataset.dim === 'none') {
        migrationState.selectedValues = [];
      } else {
        migrationState.selectedValues = [...DIMENSIONS[btn.dataset.dim].values];
      }
      // Reset filters for the newly selected breakdown dimension
      migrationState.filters = { age: 'total', sex: 'total', educ: 'total' };
      renderControls();
      renderProjectionChart();
    });
  });
}

export async function loadMigrationProjection(regionCode) {
  migrationState.regionCode = regionCode;
  migrationState.data = null;

  // Reset state for new region
  migrationState.breakdownDim = 'age';
  migrationState.selectedValues = [...DIMENSIONS.age.values];
  migrationState.filters = { age: 'total', sex: 'total', educ: 'total' };

  // Clear immediately while loading
  document.getElementById('plot-content').innerHTML = '';
  setProjectionHasData(false);

  try {
    const response = await fetch(`data/migration_projections/regions/${regionCode}.json`);
    if (!response.ok) throw new Error('No data');
    migrationState.data = await response.json();
    setProjectionHasData(true);
    renderControls();
    renderProjectionChart();
  } catch (e) {
    setProjectionHasData(false);
    document.getElementById('plot-content').innerHTML = noDataHTML();
  }
}

function renderControls() {
  // Update "Compare by" button states
  document.querySelectorAll('.migration-breakby-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dim === migrationState.breakdownDim);
  });

  // Render multi-select toggles
  const multiContainer = document.getElementById('migration-multiselect');
  if (migrationState.breakdownDim === 'none') {
    multiContainer.innerHTML = '';
  } else {
    const dim = DIMENSIONS[migrationState.breakdownDim];
    let html = `<label>${dim.label}:</label>`;
    dim.values.forEach(val => {
      const isActive = migrationState.selectedValues.includes(val);
      const color = LINE_COLORS[val];
      const bgStyle = isActive ? `background:${color};border-color:${color};` : '';
      html += `<button class="migration-toggle-btn${isActive ? ' active' : ''}"
                       data-value="${val}" style="${bgStyle}">${dim.displayLabels[val]}</button>`;
    });
    multiContainer.innerHTML = html;

    // Bind toggle events
    multiContainer.querySelectorAll('.migration-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleValue(btn.dataset.value);
      });
    });
  }

  // Render filter dropdowns for non-breakdown dimensions
  const filterContainer = document.getElementById('migration-filters');
  let filterHTML = '';
  for (const [dimKey, dimConfig] of Object.entries(DIMENSIONS)) {
    if (dimKey === migrationState.breakdownDim) continue;
    filterHTML += `
      <div class="migration-filter-group">
        <label>${dimConfig.label}</label>
        <select id="migration-${dimKey}-filter">
          <option value="total">Total</option>
          ${dimConfig.values.map(v => `<option value="${v}">${dimConfig.displayLabels[v]}</option>`).join('')}
        </select>
      </div>`;
  }
  filterContainer.innerHTML = filterHTML;

  // Bind filter events and restore values
  for (const dimKey of Object.keys(DIMENSIONS)) {
    if (dimKey === migrationState.breakdownDim) continue;
    const sel = document.getElementById(`migration-${dimKey}-filter`);
    if (sel) {
      sel.value = migrationState.filters[dimKey];
      sel.addEventListener('change', () => {
        migrationState.filters[dimKey] = sel.value;
        renderProjectionChart();
      });
    }
  }
}

function toggleValue(value) {
  const idx = migrationState.selectedValues.indexOf(value);
  if (idx >= 0) {
    if (migrationState.selectedValues.length > 1) {
      migrationState.selectedValues.splice(idx, 1);
    }
  } else {
    migrationState.selectedValues.push(value);
  }
  renderControls();
  renderProjectionChart();
}

function getLineData(breakdownValue) {
  const data = migrationState.data;
  const breakDim = migrationState.breakdownDim;

  let filtered = data;

  // Filter by breakdown dimension value
  if (breakDim !== 'none' && breakdownValue !== null) {
    const dimConfig = DIMENSIONS[breakDim];
    filtered = filtered.filter(r => r[dimConfig.key] === breakdownValue);
  }

  // Apply filters for non-breakdown dimensions
  for (const [dimKey, dimConfig] of Object.entries(DIMENSIONS)) {
    if (dimKey === breakDim) continue;
    const filterVal = migrationState.filters[dimKey];
    if (filterVal !== 'total') {
      filtered = filtered.filter(r => r[dimConfig.key] === filterVal);
    }
  }

  // Group by period and sum (starting from 2020)
  const periodSums = {};
  filtered.filter(r => r.p >= 2020).forEach(r => {
    periodSums[r.p] = (periodSums[r.p] || 0) + r.v;
  });

  const periods = Object.keys(periodSums).map(Number).sort((a, b) => a - b);
  return {
    x: periods,
    y: periods.map(p => periodSums[p])
  };
}

function renderProjectionChart() {
  const plotDiv = document.getElementById('plot-content');

  if (!migrationState.data) {
    plotDiv.innerHTML = noDataHTML();
    return;
  }

  const traces = [];

  if (migrationState.breakdownDim === 'none') {
    const lineData = getLineData(null);
    traces.push({
      x: lineData.x,
      y: lineData.y,
      mode: 'lines+markers',
      line: { color: LINE_COLORS['total'], width: 2 },
      marker: { size: 6 },
      name: 'Total',
      hovertemplate: 'Year: %{x}<br>Net migration: %{y:,.0f}<extra></extra>'
    });
  } else {
    const dim = DIMENSIONS[migrationState.breakdownDim];
    migrationState.selectedValues.forEach(val => {
      const lineData = getLineData(val);
      traces.push({
        x: lineData.x,
        y: lineData.y,
        mode: 'lines+markers',
        line: { color: LINE_COLORS[val], width: 2 },
        marker: { size: 6 },
        name: dim.displayLabels[val],
        hovertemplate: `${dim.displayLabels[val]}<br>Year: %{x}<br>Net migration: %{y:,.0f}<extra></extra>`
      });
    });
  }

  const layout = {
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: {
      family: 'Montserrat, sans-serif',
      size: 10,
      color: '#252a53'
    },
    margin: { l: 60, r: 10, t: 20, b: 40 },
    height: 340,
    xaxis: {
      dtick: 5,
      gridcolor: '#f0f0f0'
    },
    yaxis: {
      tickformat: ',.0f',
      gridcolor: '#f0f0f0',
      zerolinecolor: '#ccc',
      zerolinewidth: 1
    },
    legend: {
      orientation: 'h',
      y: -0.25,
      x: 0.5,
      xanchor: 'center',
      font: { size: 10 }
    },
    hovermode: 'x unified'
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(plotDiv, traces, layout, config);
}

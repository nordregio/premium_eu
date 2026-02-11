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
    container.innerHTML = '<p>No data available.</p>';
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

export function loadMigrationProjection(regionCode) {
  const age = document.getElementById('age').value.replace(/[–—]/g, '-');
  const gender = document.getElementById('gender').value;
  const education = document.getElementById('education').value;

  const filename = `${regionCode}_${age}_${gender.toLowerCase()}_${education.toLowerCase()}.html`;
  const plotPath = `plots/regional-projections/${filename}`;

  fetch(plotPath)
    .then(response => {
      if (response.ok) {
        document.getElementById('plot-content').innerHTML =
          `<iframe src="${plotPath}" width="100%" height="400" frameborder="0" style="border: none;"></iframe>`;
      } else {
        throw new Error('No data');
      }
    })
    .catch(() => {
      document.getElementById('plot-content').innerHTML = `
        <div class="plot-error" style="text-align: center; padding: 20px; color: #666;">
          <p>No data</p>
          <small style="color: #fff;">File not found: ${filename}</small>
        </div>
      `;
    });
}

export function loadMigrationPyramid(regionCode) {
  const year = document.getElementById('yearSlider').value;
  const pyramidPath = `plots/regional-pyramids/${regionCode}_${year}.html`;

  fetch(pyramidPath)
    .then(response => {
      if (response.ok) {
        document.getElementById('pyramid-content').innerHTML =
          `<iframe src="${pyramidPath}" width="100%" height="340" frameborder="0"></iframe>`;
      } else {
        document.getElementById('pyramid-content').innerHTML =
          `<div style="text-align: center; padding: 20px; color: #666;"><p>No data for ${year}</p></div>`;
      }
    })
    .catch(() => {
      document.getElementById('pyramid-content').innerHTML =
        `<div style="text-align: center; padding: 20px; color: #fff;"><p>Population pyramid not available for ${regionCode} in ${year}</p></div>`;
    });
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

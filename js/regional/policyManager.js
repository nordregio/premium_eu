function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const state = {
  selectedTags: [],
  selectedScopes: [],
  selectedOrigins: [],
  currentRegion: null,
  allTags: [],
  allScopes: [],
  allOrigins: [],
  isLoaded: false,
  data: []
};

export function initializePolicyData(policyData) {
  state.data = policyData;
  state.isLoaded = true;

  const allTags = new Set();
  const allScopes = new Set();
  const allOrigins = new Set();

  policyData.forEach(policy => {
    policy.policy_tags.forEach(tag => allTags.add(tag));
    if (policy.scope) allScopes.add(policy.scope);
    if (policy.origin) allOrigins.add(policy.origin);
  });

  state.allTags = Array.from(allTags).sort();
  state.allScopes = Array.from(allScopes).sort();
  state.allOrigins = Array.from(allOrigins).sort();
}

export function loadPoliciesForRegion(regionCode) {
  if (!regionCode) {
    clearPolicyDisplay();
    return;
  }

  if (!state.isLoaded) {
    console.log('Policy data not yet loaded');
    return;
  }

  state.currentRegion = regionCode;
  state.selectedTags = [];
  state.selectedScopes = [];
  state.selectedOrigins = [];

  const applicablePolicies = state.data.filter(policy =>
    policy.nuts_codes && policy.nuts_codes.includes(regionCode)
  );

  const intro = document.getElementById('policy-intro');
  if (intro) intro.style.display = 'block';

  const regionTags = new Set();
  const regionScopes = new Set();
  const regionOrigins = new Set();

  applicablePolicies.forEach(policy => {
    if (policy.policy_tags) {
      policy.policy_tags.forEach(tag => regionTags.add(tag));
    }
    if (policy.scope) regionScopes.add(policy.scope);
    if (policy.origin) regionOrigins.add(policy.origin);
  });

  displayPolicyTags(Array.from(regionTags).sort());
  displayScopeTags(Array.from(regionScopes).sort());
  displayOriginTags(Array.from(regionOrigins).sort());
  displayPolicies(applicablePolicies);
}

export function displayPolicyTags(tags) {
  const container = document.getElementById('policy-tags-container');
  const section = document.getElementById('policy-areas-section');

  if (tags.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  tags.forEach(tag => {
    const button = document.createElement('button');
    button.className = 'policy-tag-button';
    button.textContent = tag;
    button.onclick = () => togglePolicyTag(tag, button);
    container.appendChild(button);
  });
}

export function displayScopeTags(scopes) {
  const container = document.getElementById('policy-scope-container');
  const section = document.getElementById('policy-scope-section');

  if (scopes.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  scopes.forEach(scope => {
    const button = document.createElement('button');
    button.className = 'policy-tag-button policy-scope-button';
    button.textContent = scope;
    button.onclick = () => toggleScopeTag(scope, button);
    container.appendChild(button);
  });
}

export function displayOriginTags(origins) {
  const container = document.getElementById('policy-origin-container');
  const section = document.getElementById('policy-origin-section');

  if (origins.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  origins.forEach(origin => {
    const button = document.createElement('button');
    button.className = 'policy-tag-button policy-origin-button';
    button.textContent = origin;
    button.onclick = () => toggleOriginTag(origin, button);
    container.appendChild(button);
  });
}

function togglePolicyTag(tag, buttonElement) {
  const isSelected = state.selectedTags.includes(tag);

  if (isSelected) {
    state.selectedTags = state.selectedTags.filter(t => t !== tag);
    buttonElement.classList.remove('active');
  } else {
    state.selectedTags.push(tag);
    buttonElement.classList.add('active');
  }

  filterAndDisplayPolicies();
}

function toggleScopeTag(scope, buttonElement) {
  const isSelected = state.selectedScopes.includes(scope);

  if (isSelected) {
    state.selectedScopes = state.selectedScopes.filter(s => s !== scope);
    buttonElement.classList.remove('active');
  } else {
    state.selectedScopes.push(scope);
    buttonElement.classList.add('active');
  }

  filterAndDisplayPolicies();
}

function toggleOriginTag(origin, buttonElement) {
  const isSelected = state.selectedOrigins.includes(origin);

  if (isSelected) {
    state.selectedOrigins = state.selectedOrigins.filter(o => o !== origin);
    buttonElement.classList.remove('active');
  } else {
    state.selectedOrigins.push(origin);
    buttonElement.classList.add('active');
  }

  filterAndDisplayPolicies();
}

export function filterAndDisplayPolicies() {
  if (!state.currentRegion || !state.isLoaded) {
    return;
  }

  let applicablePolicies = state.data.filter(policy =>
    policy.nuts_codes && policy.nuts_codes.includes(state.currentRegion)
  );

  if (state.selectedTags.length > 0) {
    applicablePolicies = applicablePolicies.filter(policy => {
      return policy.policy_tags && state.selectedTags.some(selectedTag =>
        policy.policy_tags.includes(selectedTag)
      );
    });
  }

  if (state.selectedScopes.length > 0) {
    applicablePolicies = applicablePolicies.filter(policy => {
      return policy.scope && state.selectedScopes.includes(policy.scope);
    });
  }

  if (state.selectedOrigins.length > 0) {
    applicablePolicies = applicablePolicies.filter(policy => {
      return policy.origin && state.selectedOrigins.includes(policy.origin);
    });
  }

  displayPolicies(applicablePolicies);
}

export function displayPolicies(policies) {
  const container = document.getElementById('policy-summaries-container');
  const countElement = document.getElementById('policy-count');

  if (policies.length === 0) {
    container.innerHTML = '<div class="no-policies-message">No documents found for the selected region.</div>';
    countElement.style.display = 'none';
    return;
  }

  countElement.textContent = `${policies.length} document${policies.length === 1 ? '' : 's'} found`;
  countElement.style.display = 'block';

  container.innerHTML = '';
  policies.forEach((policy, index) => {
    const card = createPolicyCard(policy, index);
    container.appendChild(card);
  });
}

export function createPolicyCard(policy, index) {
  const card = document.createElement('div');
  card.className = 'policy-card';
  card.onclick = () => openPolicyModal(policy);

  const policyTagsHtml = policy.policy_tags.map(tag =>
    `<span class="policy-card-tag">${escapeHTML(tag)}</span>`
  ).join('');

  const scopeTagHtml = policy.scope ?
    `<span class="policy-card-tag" style="background: #4a90a4;">${escapeHTML(policy.scope)}</span>` : '';

  const originTagHtml = policy.origin ?
    `<span class="policy-card-tag" style="background: #ac5737;">${escapeHTML(policy.origin)}</span>` : '';

  card.innerHTML = `
    <div class="policy-card-tags">
      ${policyTagsHtml}
      ${scopeTagHtml}
      ${originTagHtml}
    </div>
    <div class="policy-card-summary">${escapeHTML(policy.policy_summary)}</div>
  `;

  return card;
}

export function openPolicyModal(policy) {
  const modal = document.getElementById('policy-modal');
  const title = document.getElementById('policy-modal-title');
  const description = document.getElementById('policy-modal-description');
  const meta = document.getElementById('policy-modal-meta');
  const link = document.getElementById('policy-modal-link');

  title.textContent = 'Policy details';
  description.textContent = policy.policy_description;

  meta.innerHTML = `
    <div class="policy-modal-meta-item">
      <span class="policy-modal-meta-label">Policy tags:</span>
      ${policy.policy_tags.map(escapeHTML).join(', ')}
    </div>
    <div class="policy-modal-meta-item">
      <span class="policy-modal-meta-label">Policy origin region:</span>
      ${policy.region_origin.map(escapeHTML).join(', ')}
    </div>
    <div class="policy-modal-meta-item">
      <span class="policy-modal-meta-label">Scope:</span>
      ${escapeHTML(policy.scope)}
    </div>
    <div class="policy-modal-meta-item">
      <span class="policy-modal-meta-label">Origin:</span>
      ${escapeHTML(policy.origin)}
    </div>
  `;

  const safeUrl = policy.links && (policy.links.startsWith('http://') || policy.links.startsWith('https://'))
    ? policy.links : '#';
  link.href = safeUrl;
  link.style.display = safeUrl === '#' ? 'none' : '';
  modal.style.display = 'block';
}

export function closePolicyModal() {
  document.getElementById('policy-modal').style.display = 'none';
}

export function clearPolicyDisplay() {
  state.currentRegion = null;
  state.selectedTags = [];
  state.selectedScopes = [];
  state.selectedOrigins = [];

  document.querySelectorAll('.policy-tag-button').forEach(button => {
    button.classList.remove('active');
  });

  const intro = document.getElementById('policy-intro');
  if (intro) intro.style.display = 'none';

  document.getElementById('policy-areas-section').style.display = 'none';
  document.getElementById('policy-scope-section').style.display = 'none';
  document.getElementById('policy-origin-section').style.display = 'none';
  document.getElementById('policy-count').style.display = 'none';
  document.getElementById('policy-summaries-container').innerHTML = '';
}

export function isPolicyLoaded() {
  return state.isLoaded;
}

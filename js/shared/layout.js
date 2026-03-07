/**
 * Shared layout module – renders header, footer, and disclaimer banner.
 */

/**
 * Render the site header into #header-root.
 * @param {string} activePage – one of "home", "about", "methodology", "regional", "development", "migration"
 */
export function renderHeader(activePage) {
  const el = document.getElementById('header-root');
  if (!el) return;

  const navItems = [
    { id: 'home',    label: 'HOME',         href: 'index.html' },
    { id: 'about',   label: 'ABOUT',        href: 'about.html' },
    { id: 'project', label: 'PROJECT PAGE', href: 'https://premium-eu.org/', external: true },
  ];

  const buttons = navItems.map(item => {
    const activeClass = item.id === activePage ? ' nav-active' : '';
    if (item.external) {
      return `<button type="button"
                onclick="window.open('${item.href}', '_blank')"
                class="text-black font-medium rounded-lg px-5 py-2.5 me-2 mb-2${activeClass}">
          ${item.label}
        </button>`;
    }
    return `<button type="button"
              onclick="window.location.href='${item.href}';"
              class="text-black font-medium rounded-lg px-5 py-2.5 me-2 mb-2${activeClass}">
        ${item.label}
      </button>`;
  }).join('\n');

  el.innerHTML = `
    <div class="header">
      <div>
        <a href="index.html">
          <img src="img/PREMIUM_logos/PNG/PREMIUM_EU_Logo_Stack_Payoff_BLUE.png" class="h-12">
        </a>
      </div>
      <div class="header-nav">
        ${buttons}
      </div>
    </div>`;
}

/**
 * Render the site footer into #footer-root.
 * @param {Object} [options]
 * @param {boolean} [options.dark=false] – use the dark colour variant
 */
export function renderFooter({ dark = false } = {}) {
  const el = document.getElementById('footer-root');
  if (!el) return;

  const darkClass = dark ? ' footer--dark' : '';
  const textColor = dark ? 'color: white;' : 'color: #252a53;';

  el.innerHTML = `
    <footer class="footer${darkClass}">
      <div class="footer-column">
        <img src="img/eu_logo.png">
        <p style="width: 260px; ${textColor}">PREMIUM_EU was made possible thanks to funding from the European Union's Horizon Europe programme.</p>
      </div>
      <div class="footer-column"></div>
      <div class="footer-column">
        <h1> _Site map </h1>
        <p><a href="index.html">Homepage</a></p>
        <p><a href="about.html">About</a></p>
        <p><a href="methodology.html">Methodology</a></p>
        <p><a href="regional.html">Regional profiles</a></p>
        <p><a href="development.html">Europe's Regions</a></p>
        <p><a href="migration.html">Migration Trends</a></p>
        <p><a href="community_inputs.html">Community Inputs</a></p>
      </div>
      <div class="footer-column">
        <h1> _Contacts </h1>
        <h2> Lead project manager: </h2>
        <p>
          Leo van Wissen <br>
          wissen@nidi.nl <br>
          Netherlands Interdisciplinary Demographic Institute
        </p>
        <h2> Communications: </h2>
        <p>
          Anne Katrine Ebbesen <br>
          anne-katrine.ebbesen@nordregio.org <br>
          Nordregio
        </p>
      </div>
    </footer>`;
}

/**
 * Render the disclaimer banner into #disclaimer-root (index.html only).
 */
export function renderDisclaimer() {
  const el = document.getElementById('disclaimer-root');
  if (!el) return;

  el.innerHTML = '';
}

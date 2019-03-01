const containerId = 'chattersContainer-aoxie43dhjf456fkloia39';

function fetch_text(url) {
  return fetch(url).then((response) => (response.text()));
}

function configToStyles(uiConfig) {
  // uiConfig = {
  //   position: 'fixed',
  //   links: 'underlined'
  // };
  const propToStyles = {
    position: {
      relative: 'h1 { background: red; }',
    },
    links: {
      underlined: '#root-aoxie43dhjf456fkloia39 .chat .app-tab .tab-header { background-color: yellow !important;}'
    }
  };
  const styles = Object.entries(uiConfig || {}).reduce((acc, entry, idx) => {
    const prop = entry[0];
    const attributeToApply = entry[1];
    const styleToAdd = propToStyles[prop] && propToStyles[prop][attributeToApply] ? propToStyles[prop][attributeToApply] + '\n' : ''
    const result = acc + styleToAdd
    return result
  }, '');

  return styles
}

function createStyles(container) {
  const config = window.chattersCfg_aoxie43dhjf456fkloia39;

  var css = configToStyles(config.uiProps);
  var style = document.createElement('style');

  style.type = 'text/css';

  style.appendChild(document.createTextNode(css));

  container.appendChild(style);
}

function loadApp() {
  fetch_text("/superChat/build/index.html").then((html) => {
    const el = document.createElement('div');
    el.innerHTML = html;
    const scripts = el.getElementsByTagName('script');
    // TODO remove script and meta elements from html to inject
    const container = document.getElementById(containerId);
    container.innerHTML = html;
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const scriptEl = document.createElement('script');
      scriptEl.src = script.src;
      container.appendChild(scriptEl);
    }
    createStyles(container)

  }).catch((error) => {
    console.warn(error);
  });
}

loadApp();
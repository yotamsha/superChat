const containerId = 'chattersContainer-aoxie43dhjf456fkloia39';

function fetch_text (url) {
  return fetch(url).then((response) => (response.text()));
}

  function loadApp () {
    fetch_text("https://superchat-e7dbf.firebaseapp.com/index.html").then((html) => {
      const regex = /\/static\//gi;
      html = html.replace(regex, 'https://superchat-e7dbf.firebaseapp.com/static/');
      const el = document.createElement('div');
      el.innerHTML = html;
      const scripts = el.getElementsByTagName('script');
      // TODO remove script and meta elements from html to inject
      const container = document.getElementById(containerId);
      container.innerHTML = html;
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const scriptEl = document.createElement( 'script' );
        scriptEl.src = script.src;
        container.appendChild(scriptEl);
      }

    }).catch((error) => {
      console.warn(error);
    });
  }
// function prepareFrame(config) {
//     const uiProps = config.uiProps;
//     const ifrm = document.createElement("iframe");
//     ifrm.setAttribute("src", "https://superchat-e7dbf.firebaseapp.com/index.html?appId=" + config.appId);
//     ifrm.style.border = "0px";
//     ifrm.style.height = "535px";
//     ifrm.style.width = "100%";
//     ifrm.style.right = "0";
//     ifrm.style.bottom = "0px";
//     ifrm.style.position = uiProps.position || 'fixed';
//     document.getElementById('superChatContainer').appendChild(ifrm);
// }

loadApp();
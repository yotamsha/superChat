const config = window.superChatCfg_rwe43dhjf456fkloia39;

function prepareFrame(config) {
    const uiProps = config.uiProps;
    const ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", "https://superchat-e7dbf.firebaseapp.com/index.html?appId=" + config.appId);
    ifrm.style.border = "0px";
    ifrm.style.height = "300px";
    ifrm.style.width = "100%";
    ifrm.style.right = "0";
    ifrm.style.bottom = "0px";
    ifrm.style.position = uiProps.position || 'fixed';
    document.getElementById('superChatContainer').appendChild(ifrm);
}

prepareFrame(config);
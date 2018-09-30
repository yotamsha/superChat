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
//     <iframe src="http://localhost:5000/index.html?appId=FANLZucFAQUK6H9caIKC&position"
// style="
// border: 0px;
// position: fixed;
// bottom: 0;
// height: 300px;
// right: 0;
// width: 600px;">
// </iframe>
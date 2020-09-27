$(document).ready(function () {
    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('client-version')) {
        let clientVersion = urlParams.get('client-version');
        if (/^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(clientVersion)) {
            localStorage.setItem('client-version', clientVersion);
        }
    }
    /* TODO: remove bottom code */
    if (urlParams.get('reload-page')) {
        let reloadPageTotal = urlParams.get('reload-page');
        if (localStorage.getItem('reload-page') < reloadPageTotal) {
            setTimeout(function () {
                let reloadPageIndex = localStorage.getItem('reload-page');

                if (reloadPageIndex == null) {
                    localStorage.setItem('reload-page', 0);
                }
                localStorage.setItem('reload-page', parseInt(localStorage.getItem('reload-page')) + 1);
                location.reload();
            }, 5000);
        }
    }
});
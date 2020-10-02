
createDropdownElt('parameter-menus', "{{'browser.visit.HEAD_VISIT' | translate}}", function () {
    if (window.nwjsVisitBar.style.display = "none")
        openVisit([]);
}, "load_visit");
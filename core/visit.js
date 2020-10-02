var visit_timeout = null;


function load_visit_txt(ffile) {
    // List of website to visit
    let visit_list = [];

    const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(ffile)
    });

    lineReader.on('line', function (line, last) {
        visit_list.push(line);
    });

    lineReader.on('close', function () {
        openVisit(visit_list);
    })

}

function closeVisit() {
    window.nwjsVisitBar.style.display = "none";
    const L = window.nwjsVisitList.length;
    for (var i = L; i >= 0; i--) {
        window.nwjsVisitList.remove(i);
    }
    window.nwjsVisitBar.removeEventListener(
        'click',
        navigate_visit
    );

    window.nwjsVisitList.removeEventListener(
        'change',
        visit_url
    );
}

//Sortable chart windows
function openVisit(visit_list) {
    visit_list.forEach((visit) => {
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode(visit));
        window.nwjsVisitList.appendChild(opt);
    })

    window.nwjsVisitBar.style.display = "block";

    window.nwjsVisitBar.addEventListener(
        'click',
        navigate_visit
    );

    window.nwjsVisitList.addEventListener(
        'change',
        visit_url
    );

    //Hidden filedialog
    const file_dialog_visit = document.createElement("INPUT");
    file_dialog_visit.style = "display:none;";
    file_dialog_visit.id = "fileDialog_path";
    file_dialog_visit.type = "file";
    file_dialog_visit.accept = ".txt,text/plain"
    document.querySelector('nav').appendChild(file_dialog_visit);
    window.nwjsDialogOpenVisit = file_dialog_visit;

    //Setup load txt trigger
    file_dialog_visit.addEventListener("change", function (evt) {
        load_visit_txt(this.value);
        this.value = "";
    }, false);
};

function next_visit() {
    window.nwjsBrowser.removeEventListener("load", next_visit);
    clearTimeout(visit_timeout);
    setTimeout(function () {
        if (document.querySelector('#visit-play-pause').classList.contains("fa-pause") && window.nwjsVisitList.selectedIndex < window.nwjsVisitList.length - 1) {
            window.nwjsVisitList.selectedIndex++;
            visit_url();
        }
    }, 1000);
}

function visit_url() {
    const url = window.nwjsVisitList.selectedOptions[0].text;
    window.nwjsBrowser.contentWindow.window.location.href = url;
    console.log("Visit -> Visiting url : " + url);
    nwjsHeader.querySelector('#address').value = url;
    window.nwjsBrowser.addEventListener("load", next_visit); // In case page is loaded
    visit_timeout = setTimeout(next_visit, 60000); //In case page takes time to be fully loaded
}

function navigate_visit(e) {
    // Set action depending on click event
    switch (e.target.id) {
        case 'visit-close':
            closeVisit();
            break;
        case 'visit-reduce':
            window.nwjsVisitBar.classList.toggle("reduce");
            break;
        case 'visit-play-pause':
            if (e.target.classList.contains("fa-play")) {
                const idx = window.nwjsVisitList.selectedIndex;
                window.nwjsVisitList.selectedIndex = idx == -1 ? 0 : idx + 1;
                visit_url();
            }
            e.target.classList.toggle("fa-play");
            e.target.classList.toggle("fa-pause");

            break;
        case 'visit-init':
            window.nwjsVisitList.selectedIndex = 0;
            visit_url();
            break;
        case 'visit-next':
            if (window.nwjsVisitList.selectedIndex < window.nwjsVisitList.length - 1) {
                window.nwjsVisitList.selectedIndex++;
                visit_url();
            }
            break;
        case 'visit-add':
            let opt = document.createElement('option');
            const url = nwjsHeader.querySelector('#address').value;
            opt.appendChild(document.createTextNode(url));
            window.nwjsVisitList.appendChild(opt);
            break;
        case 'visit-remove':
            window.nwjsVisitList.remove(window.nwjsVisitList.selectedOptions[0]);
            break;
        case 'visit-import':
            window.nwjsDialogOpenVisit.click();
            break;
        case 'visit-export':
            const urls = Array.from(window.nwjsVisitList.options);
            var blob = new Blob([urls.map(x => x.text).join("\n")], { type: 'text/plain' });
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            const export_url = window.URL.createObjectURL(blob);
            a.href = export_url;
            a.download = "exported-list-from-" + new Date().toLocaleDateString() + ".txt";
            a.click();
            window.URL.revokeObjectURL(export_url);
            break;
        case 'visit-prev':
            if (window.nwjsVisitList.selectedIndex > 0) {
                window.nwjsVisitList.selectedIndex--;
                visit_url();
            }
            break;
    }
}


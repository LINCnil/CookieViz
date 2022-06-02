
var visit_timeout = null;
const apiHost = 'ats.api.alexa.com';

async function checkUrls(sites) {
    const prefixs = ["https://www.", "https://", "http://www.", "http://"];
    const ok_urls = [];
    for (const site of sites) {
        for (const prefix of prefixs) {
            const url = prefix + site.DataUrl;
            try {
                const response = await fetch(url);
                ok_urls.push(url);
                break;
            } catch (error) {
                continue;
            }
        }
    }

    openVisit(ok_urls);
}

async function callATS(apikey, country, count) {
    const list_interval = 10;
    const error_div = document.getElementById("alexa_response");
    var i = 1;
    error_div.innerHTML = "0%";
    while (i < count + 1) {
        const start = i;
        const count_frame = i + list_interval < count + 1 ? list_interval : count - i + 1;

        var uri = '/api?Action=TopSites&Count=' + count_frame + '&CountryCode=' + country + '&ResponseGroup=Country&Output=json&Start=' + start;

        var opts = {
            json: true,
            headers: { 'x-api-key': apikey },
            resolveWithFullResponse: true
        }

        const response = await fetch('https://' + apiHost + uri, opts);
        const json = await response.json();
        if (json.Ats.Results.ResponseStatus.StatusCode != "200") {
            error_div.innerHTML = 'failed to fetch list from alexa :' + json.Ats.Results.ResponseStatus.StatusCode;
            throw data.Ats.Results.Result.Alexa.Request.Errors.Error.ErrorCode
        }
        await checkUrls(json.Ats.Results.Result.Alexa.TopSites.Country.Sites.Site);
        i += list_interval;
        error_div.innerHTML = Math.round(100 * i / count).toString() + "%";
    }
    error_div.innerHTML = "OK";
}

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
    window.alexaModal = document.getElementById('visit_modal');
    file_dialog_visit.addEventListener("change", function (evt) {
        load_visit_txt(this.value);
        this.value = "";
    }, false);

    window.alexaForm = document.getElementById("alexa_form");
    window.alexaForm.addEventListener("submit", function (event) {
        event.preventDefault();
        callATS(event.target.api_key.value, event.target.country_select.value, parseInt(event.target.alexa_list_size.value));
    });
};

function next_visit() {
    window.nwjsBrowser.removeEventListener("contentload", next_visit);
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
    window.nwjsBrowser.src = url;
    console.log("Visit -> Visiting url : " + url);
    nwjsHeader.querySelector('#address').value = url;
    nwjsBrowser.dispatchEvent(new_page_event);
    window.nwjsBrowser.addEventListener("contentload", next_visit); // In case page is loaded
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
        case 'visit-download':
            // Show download modal
            const modal = document.getElementById("visit_modal");
            modal.style.display = "block";
        case 'visit-prev':
            if (window.nwjsVisitList.selectedIndex > 0) {
                window.nwjsVisitList.selectedIndex--;
                visit_url();
            }
            break;
    }
}




createDropdownElt('parameter-menus', "{{'browser.visit.HEAD_VISIT' | translate}}", function () {
    if (window.nwjsVisitBar.style.display = "none")
        openVisit([]);
}, "load_visit");
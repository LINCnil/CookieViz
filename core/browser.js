var gui = require('nw.gui');
var win = gui.Window.get();

const new_page_event = new Event('new_page');

//Viz container
const viz_windows = [];

window.addEventListener(
    'DOMContentLoaded',
    initBrowser
);

function initBrowser(){
    if(config.homepage.indexOf('//')<0){
        config.homepage='http://'+config.homepage;
    }
    
    if(config.showDevTools){
        setTimeout(
            function(){
                win.showDevTools();
            },
            2000
        );
    }

    window.nwjsHeader=document.querySelector('#navigation-bar');
    window.nwjsBrowser=document.querySelector('#browser');
    window.nwjsVisitList=document.querySelector('#visit-list');
    window.nwjsVisitBar=document.querySelector('#visit-bar');

    nwjsHeader.addEventListener(
        'click',
        navigate
    );
    
    nwjsHeader.addEventListener(
        'keyup',
        go
    );
    
    setTimeout(
        function(){           
            win.title=config.name;
            nwjsHeader.querySelector('#address').value=config.homepage;
            nwjsBrowser.src=config.homepage;
            nwjsBrowser.dispatchEvent(new_page_event);
            setTimeout(
                function(){
                    nwjsBrowser.style.opacity=1;
                },600
            );
            nwjsHeader.style.opacity=1;
            nwjsBrowser.addEventListener("contentload", function () {
                nwjsHeader.querySelector('#address').value=nwjsBrowser.src;
            });
        },300
    );
}

function go(e){
    if(e.keyCode!==13){
        return;
    }

    if(e.target.value.indexOf('//')<0){
        e.target.value='http://'+e.target.value;
    }
    
    nwjsBrowser.src=e.target.value;
    nwjsBrowser.dispatchEvent(new_page_event);
}

async function closeBrowser(){
    try {
        viz_windows.forEach(viz_win => viz_win.close());
        viz_windows.length = 0;
        win.hide(); // Pretend to be closed already
        console.log("browser -> En cours de fermeture...");
        await unloadAnalysis();
        win.close(true); // then close it forcefully
    } catch (error){
        console.log("browser -> "+error);
        // Just in case something happened...
        win.close(true); 
    }
}

win.on('close', function () {
    closeBrowser();
});


//Sortable chart windows
function openViz () {
    nw.Window.open("./"+currentLang+".cookieviz.html",{
        position: 'mouse',
        width: 1024,
        height: 768
    }, function(new_win) {
        new_win.requestAttention(true); 
        new_win.setResizable(true);
        viz_windows.push(new_win);
    });
}


function navigate(e){
    // Set action depending on click event
    switch(e.target.id){
        case 'back' :
            nwjsBrowser.back( () => nwjsBrowser.dispatchEvent(new_page_event));
            
            break;
        case 'forward' :
            nwjsBrowser.forward(() => nwjsBrowser.dispatchEvent(new_page_event));
            break;
        case 'refresh' :
            nwjsBrowser.src=nwjsBrowser.src;
            break;
        case 'address' :
            e.target.select();
            break;
        case 'viz':
            openViz();
            break;    
        case 'language':
        case 'settings':
            openDropdown(e.target.id);
            return
    }

    // Close dropdown if opened
    closeDropdown(nwjsBrowser.contentWindow);
}



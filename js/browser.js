var gui = require('nw.gui');
var win = gui.Window.get();
var fs = require('fs');

const homepage = "https://linc.cnil.fr/fr/cookieviz-une-dataviz-en-temps-reel-du-tracking-de-votre-navigation"
var cookieviz_windows = [];

window.addEventListener(
    'DOMContentLoaded',
    initBrowser
);

function initBrowser(){
    window.nwjsHeader=document.querySelector('header');
    window.nwjsBrowser=document.querySelector('#browser');
    
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
            win.title="Navigateur CookieViz";
            nwjsHeader.querySelector('#address').value=homepage;
            nwjsBrowser.contentWindow.window.location.href=homepage;
            setTimeout(
                function(){
                    nwjsBrowser.style.opacity=1;
                },600
            );
            nwjsHeader.style.opacity=1;
            openCookieViz();
            nwjsBrowser.addEventListener("load", function () {
                nwjsHeader.querySelector('#address').value=nwjsBrowser.contentWindow.window.location.href;
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
    
    nwjsBrowser.contentWindow.window.location.href=e.target.value;
}

function openCookieViz(){
    nw.Window.open("./cookieviz/index.html",{
        position: 'mouse',
        width: 1000,
        height: 600
    }, function(new_win) {
        new_win.requestAttention(true); 
        new_win.setResizable(true);
        cookieviz_windows.push(new_win);
    });
}


function closeCookieViz(){
    cookieviz_windows.forEach(function(cookie_win){
        cookie_win.close();
    })
    cookieviz_windows = [];
}

deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                try{
                    fs.unlinkSync(curPath);
                } catch (error){
                    console.log(error);
                }  
            }
        });
        try{
            fs.rmdirSync(path);
        }catch (error){
            console.log(error);
        }
    }
};


win.on('close', async function () {
    this.hide(); // Pretend to be closed already
    console.log("En cours de fermeture...");
    closeCookieViz();

    deleteFolderRecursive(require('nw.gui').App.dataPath);

    this.close(true); // then close it forcefully
});

function navigate(e){
    switch(e.target.id){
        case 'back' :
        case 'forward' :
            nwjsBrowser.contentWindow.window.history[e.target.id]();
            break;
        case 'refresh' :
            nwjsBrowser.contentWindow.window.location.reload();
            break;
        case 'cookieviz' :
            openCookieViz();
            break;
        case 'address' :
            e.target.select();
            break;
    }
}

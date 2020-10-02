function logError(error){
    var scripts = document.getElementsByTagName("script"),
    src = scripts[scripts.length-1].src;

    console.log(src + " --> " + error);
}
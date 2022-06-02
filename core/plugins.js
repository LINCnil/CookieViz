//Plugins container
const loaded_plugins = [];

function initAnalysis(plugins_module){
    loaded_plugins.push(plugins_module);

    if(plugins_module.init){
        plugins_module.init();
    }
}

async function unloadAnalysis() {
    for (const plugin of loaded_plugins) {
        if (plugin.delete) {
            const isAsync = plugin.delete.constructor.name === "AsyncFunction";
            if (isAsync) {
                await plugin.delete();
            } else {
                plugin.delete();
            }
        }
    };
}

function clearPlugins() {
    for (const loaded_plugin of loaded_plugins) {
        if (loaded_plugin.tables) {
            cleanDB(loaded_plugin.tables);
        }
    }
}
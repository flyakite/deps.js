
var deps = (function() {

  var d = {};
  var shim, paths, config = {};
  var scriptsToLoad = [];
  var init = false;
  var loaded = [];
  var loading = [];

  var loadScript = function(src, callback) {
    var s = document.createElement('script');
    s.src = src;
    (document.head || document.documentElement).appendChild(s);
    s.onload = callback;
  };

  var loadScriptAndSetLoaded = function(key) {
    //console.log('loadScriptAndSetLoaded '+key);
    if(loading.indexOf(key) != -1){
      //console.log('already loading '+key);
      return;
    }else{
      loading.push(key);
    }

    if(loaded.indexOf(key) != -1){
      //console.log('already loaded '+key);
      return;
    }else{
      //console.log(key + '  loading...');
      loadScript(paths[key], function() {
        loaded.push(key);
        //console.log(key + '  loaded');
      });  
    }
  };

  var waitForDepsLoadedAndLoad = function(key) {
    var listToWait = shim[key] && shim[key].deps;
    setTimeout(function() {
      var done = true;
      for(var i = listToWait.length; i--;){
        if(loaded.indexOf(listToWait[i]) == -1){
          done = false;
          break;
        }
      }
      if(done){
        //console.log('all deps loaded:'+ shim[key].deps);
        loadScriptAndSetLoaded(key);  
      }else{
        waitForDepsLoadedAndLoad(key);
      }
    }, 50);
  };

  var checkAndloadDeps = function(deps) {
    for(var i = deps.length; i--;){
      if(!loaded.hasOwnProperty(deps[i]) && !loading.hasOwnProperty(deps[i])){
        recursivelyLoadDeps(deps[i], null);
      }
    }
  };

  var recursivelyLoadDeps = function(key) {
    //console.log('check '+ key);
    var deps;
    if(shim.hasOwnProperty(key)){
      deps = shim[key].deps;
      checkAndloadDeps(deps);
      waitForDepsLoadedAndLoad(key);
    }else{
      //console.log('first prepare to load ' + key);
      loadScriptAndSetLoaded(key);
    }
  };

  d.config = function(config) {
    d._config = config;
  };

  d.load = function(scriptKeyOrKeys) {
    config = d._config;
    paths = config.paths;
    shim = config.shim;
    //console.log(scriptKeyOrKeys);
    scriptsToLoad = typeof scriptKeyOrKeys == 'string' ? [scriptKeyOrKeys]:scriptKeyOrKeys;
    if(config && Object.keys(config).length == 0 || (paths && Object.keys(paths).length == 0)){
      throw 'Error: no config';
    }
    //console.log(scriptsToLoad);
    for(var i = scriptsToLoad.length; i--;){
      if(!paths.hasOwnProperty(scriptsToLoad[i])){
        throw 'Error: '+key+' no in config';
      }
      recursivelyLoadDeps(scriptsToLoad[i]);
    }
  };
  return d;
}());
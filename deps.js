
var deps = (function() {

  var d = {};
  var shim, paths, config = {};
  var css = {};
  var scriptsToLoad = [];
  var init = false;
  var loaded = [];
  var loading = [];
  var waitSeconds;
  var retry = {}, maxRetry;
  var retryConnectionRegistry = {};

  var retryConnection = {
    hold: function(registerID, timeout, callback) {
      var timeout = timeout * 1000;
      var control = setTimeout(function() {
        retryConnectionRegistry[registerID] = {};
        callback();
      }, timeout);
      retryConnectionRegistry[registerID] = { 'timeout': timeout,
                          'control': control};
    },
    release: function(registerID) {
      if (retryConnectionRegistry[registerID]){
        clearTimeout(retryConnectionRegistry[registerID].control);
      }
      retryConnectionRegistry[registerID] = {};  
    }
  };

  var loadStyle = function() {
    var style = document.createElement("style");
    for(var k in css){
      style.innerHTML += "@import url('"+ css[k] +"');";
    }
    document.head.appendChild(style);
  };

  var loadScript = function(src, callback) {
    var s = document.createElement('script');
    s.src = src;
    (document.head || document.documentElement).appendChild(s);
    s.onload = callback;
  };

  var loadScriptAndSetLoaded = function(key) {
    //console.log('loadScriptAndSetLoaded '+key);
    if(!paths.hasOwnProperty(key)){
      throw key + ' not in config paths.';
    }
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
      var performLoadScript = function() {
        //console.log('performLoadScript: ' + key)
        loadScript(paths[key], function() {
          loaded.push(key);
          //console.log(key + '  loaded');
          retryConnection.release(key);
        });  
      };

      var timeout = shim[key] && shim[key].waitSeconds || waitSeconds;
      retry[key] = shim[key] && shim[key].retry || maxRetry;
      retry[key] = parseInt(retry[key], 10);
      retryConnection.hold(key, timeout, function() {
        if(retry[key] > 0){
          performLoadScript();
          retry[key]--;
        }
      });
      performLoadScript();
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
    if(shim.hasOwnProperty(key) && shim[key].deps){
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
    css = config.css;
    waitSeconds = config.waitSeconds || 7;
    maxRetry = config.retry || 0;
    loadStyle();
    //console.log(scriptKeyOrKeys);
    scriptsToLoad = typeof scriptKeyOrKeys == 'string' ? [scriptKeyOrKeys]:scriptKeyOrKeys;
    if(config && Object.keys(config).length == 0 || (paths && Object.keys(paths).length == 0)){
      throw 'No config.';
    }
    //console.log(scriptsToLoad);
    for(var i = scriptsToLoad.length; i--;){
      if(!paths.hasOwnProperty(scriptsToLoad[i])){
        throw key+' no in config.';
      }
      recursivelyLoadDeps(scriptsToLoad[i]);
    }
  };
  return d;
}());
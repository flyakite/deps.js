# deps.js
Load javascript and its dependencies for content script.

In browser extensions, the content script shares the dom with scripts in the page but not javascript execution environment. The content script execution environment is isolated.

We want to load scripts to the page(not content script environment), but some of the scripts have dependencies with scripts from browser extension which cause other dependancy loaders not working. So we create this for content script to load scripts with their dependencies.

Inspired by require.js

## Usage
```javascript
//set config
deps.config({
  paths: {
    'jsapi': 'http://example.com/_ah/channel/jsapi',
    'jquery': chrome.extension.getURL('jquery-1.10.2.min.js'),
    'gmail': chrome.extension.getURL('gmail.js'),
    'react': chrome.extension.getURL('react-with-addons.js'),
    'dashboard': chrome.extension.getURL('dashboard.js'),
    'main': chrome.extension.getURL('main.js')
    'app': chrome.extension.getURL('app.js')
  },
  shim: {
    'jquery': {
      'waitSeconds': 3,
      'retry': 1
    },
    'dashboard':{
      'deps': ['react', 'jquery'],
      'retry': 1
    },
    'main':{
      'deps': ['jsapi', 'jquery', 'gmail', 'dashboard']
    }
  },
  waitSeconds: 10, //seconds to wait for each script or timeout, optional, default 7
  retry: 2,  //retry times for each script, optional, default 0
  css:{
    'bootstrap': 'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css',
    'style': 'style.css'
  }
});

//load script
deps.load('main');
deps.load(['app', 'main']);
```

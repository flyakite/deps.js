# deps.js
Load javascript file and its dependencies.
In browser extensions, the content script shares the dom with scripts in the page but not javascript execution environment. The content script execution environment is isolated.

We want to load scripts to the page(not content script environment), but some of the scripts have dependencies with scripts from browser extension which cause other dependancy loader not working. So we create this for content script.

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
    'dashboard':{
      'deps': ['react', 'jquery']
    },
    'main':{
      'deps': ['jsapi', 'jquery', 'gmail', 'dashboard']
    }
  }
});

//load script
deps.load('main');
deps.load(['app', 'main']);
```

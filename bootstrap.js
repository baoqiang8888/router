"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// An example of how to create a string bundle for localization.
XPCOMUtils.defineLazyGetter(this, "Strings", function() {
  return Services.strings.createBundle("chrome://youraddon/locale/youraddon.properties");
});

// An example of how to import a helper module.
XPCOMUtils.defineLazyGetter(this, "Helper", function() {
  let sandbox = {};
  Services.scriptloader.loadSubScript("chrome://youraddon/content/helper.js", sandbox);
  return sandbox["Helper"];
});

var gWindow;

function logTabOpen(event) {
  var tabs = gWindow.BrowserApp.tabs;
  tabs.forEach(function(tab) {
    tab.window.document.body.style.border = "5px solid red";
  });
}

function loadIntoWindow(window) {
    if (!window)
    return;
  gWindow = window;
  window.BrowserApp.deck.addEventListener("TabOpen", logTabOpen, false);
}

function unloadFromWindow(window) {
  window.BrowserApp.deck.removeEventListener("TabOpen", logTabOpen, false);
}



function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getMostRecentWindow("navigator:browser");
  loadIntoWindow(windows);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN) {
    return;
  }

  // Unload from any existing windows
  let windows = Services.wm.getMostRecentWindow("navigator:browser");
  unloadFromWindow(windows);
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}

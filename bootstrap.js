const Cc = Components.classes;
const Ci = Components.interfaces;
 
function viewSource(window) {
  window.console.log("view-source@mydomain.org: displaying source for " + window.content.location.href);
  window.BrowserApp.addTab("view-source:" + window.content.location.href);
}

var menuId;

function myFunction(event){
    if(!event)
      return;
    let thisTab = event.originalTarget;
    window.NativeWindow.toast.show("Button 1 was tapped", "short");
    thisTab.window.document.body.style.border = "5px solid red";  
  
}


  var myExtension = {
    init: function() {
      var appcontent = document.getElementById("appcontent");   // browser
      if(appcontent){
        appcontent.addEventListener("DOMContentLoaded", myExtension.onPageLoad, true);
      }
      var messagepane = document.getElementById("messagepane"); // mail
      if(messagepane){
        messagepane.addEventListener("load", function(event) { myExtension.onPageLoad(event); }, true);
      }
    },

    onPageLoad: function(aEvent) {
      var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
      // do something with the loaded page.
      // doc.location is a Location object (see below for a link).
      // You can use it to make your code executed on certain pages only.
      doc.body.style.border = "5px solid red"; 
      if(doc.location.href.search("forum") > -1)
        alert("a forum page is loaded");
      
      // add event listener for page unload 
      aEvent.originalTarget.defaultView.addEventListener("unload", function(event){ myExtension.onPageUnload(event); }, true);
    },

    onPageUnload: function(aEvent) {
      // do something
    }
  };

 
function loadIntoWindow(window) {
  if (!window)
    return;

  nativeWindow = window.NativeWindow;
  browserApp = window.BrowserApp;
  browserApp.deck.addEventListener("TabOpen", myFunction, false);

  //menuId = window.NativeWindow.menu.add("View Source", null, function() {
    //viewSource(window);
  //});
}
 
function unloadFromWindow(window) {
  if (!window)
    return;
  //window.NativeWindow.menu.remove(menuId);
  browserApp = window.BrowserApp;
  browserApp.deck.removeEventListener("TabOpen", myFunction, false);
}
 
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
       myExtension.init();
    }, false);
  },
  
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};
 
function startup(aData, aReason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Load into any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
 
  // Load into any new windows
  wm.addListener(windowListener);
}
 
function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;
 
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Stop listening for new windows
  wm.removeListener(windowListener);
 
  // Unload from any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}
 
function install(aData, aReason) {}
function uninstall(aData, aReason) {}
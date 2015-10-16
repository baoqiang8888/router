const Cc = Components.classes;
const Ci = Components.interfaces;
 
function viewSource(window) {
  window.console.log("view-source@mydomain.org: displaying source for " + window.content.location.href);
  window.BrowserApp.addTab("view-source:" + window.content.location.href);
}

var menuId;

function myFunction(aEvent){
    if(!aEvent)
      return;
    let browser = aEvent.target; 
    browser.addEventListener("load", function () {
      browser.contentDocument.body.innerHTML = "<div>hello world</div>";
    }, true);
    //window.NativeWindow.toast.show("Button 1 was tapped", "short");
    //thisTab.window.document.body.style.border = "5px solid red";  
  
}

function onPageLoad(aEvent) {
  // the target is an HTMLDocument


  let doc = aEvent.originalTarget;
  let browser = BrowserApp.getBrowserForDocument(doc);
  let tab = BrowserApp.getTabForBrowser(browser);
  //browser.contentDocument.body.innerHTML = "<div>hello world</div>";
  doc.body.style.border = "5px solid red";
}

 
function loadIntoWindow(window) {
  if (!window)
    return;

  nativeWindow = window.NativeWindow;
  browserApp = window.BrowserApp;
  //browserApp.deck.addEventListener("TabOpen", myFunction, false);
 
    BrowserApp.deck.addEventListener("load", onPageLoad, false);
  

  //menuId = window.NativeWindow.menu.add("View Source", null, function() {
    //viewSource(window);
  //});
}
 
function unloadFromWindow(window) {
  if (!window)
    return;
  //window.NativeWindow.menu.remove(menuId);
  browserApp = window.BrowserApp;
  BrowserApp.deck.removeEventListener("load", onPageLoad, false);
}
 
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
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
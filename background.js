// tabStuff();
// 
// 
// function tabStuff() {
//   var tabs = [];
//   var closedTabs = [];
//   var bookmarks = [];
// 
//   $(document).keydown(function (e) {
//     console.log({e})
//     debugger;
//     // if (e.ctrlKey == 18) {
//     //     alert("ALT was pressed");
//     // }
//   });
//   console.log('chrome:', chrome)
//   chrome.tabs.onRemoved.addListener(function(tabId) {
//     recordTabsRemoved([tabId], null);
//     if (getJumpToLatestTabOnClose()) {
//       switchTabs(tabs[activeTabsIndex].id); // jump to latest = tabs[0]
//     }
//   });
// 
//   chrome.tabs.onCreated.addListener(function(tab) {
//     console.log('created tab', tab, 'selected tab is ', t2);
//     // add foreground tabs first in list and background tabs to end
//     if (tab.active) {
//       tabs.unshift(tab);
//     } else {
//       tabs.push(tab);
//     }
//     updateBadgeText();
//   });
// 
//   function lastTab() {
//     chrome.windows.getLastFocused({populate: false, windowTypes: ['normal', 'popup']}, function(window) {
//       if (window.focused) {
//         // Chrome is currently focused, and more specifically a normal chrome tab
//         chrome.tabs.query({active: true, currentWindow: true}, function(t) {
//           var activeTab = t[0];
//           if (activeTab.id === tabs[activeTabsIndex].id) {
//             switchTabs(tabs[activeTabsIndex + 1].id); // jump to previous = tabs[1]
//             activeTabsIndex++;
//           } else {
//             // since the user has some other tab active and not the latest, first jump back to it
//             switchTabs(tabs[activeTabsIndex].id); // jump to latest = tabs[0]
//           }
//         });
//       } else {
//         // In focus is a Global OS-app or chrome windowsTypes: 'popup','devtools'
//         switchTabs(tabs[activeTabsIndex].id); // jump to latest = tabs[0]
//       }
//     });
//   }
// 
// 
//   function switchTabs(tabid) {
//     chrome.tabs.get(tabid, function(tab) {
//       // Focus the window before the tab to fix issue #273
//       chrome.windows.update(tab.windowId, {focused: true}, function() {
//         // focus the tab
//         chrome.tabs.update(tabid, {active: true}, function(tab) {
//           // // move the tab if required
//           console.log("switched tabs", tabid, tab);
//         });
//       });
//     });
//   }
// 
//   function updateTabsOrder(tabArray) {
//     for (var j = tabArray.length - 1; j >= 0; j--) {
//       updateTabOrder(tabArray[j].id)
//     }
//   }
// 
//   function updateTabOrder(tabId) {
// 
//     setTimeout(() => {
//       var idx = indexOfTab(tabId);
//       if (idx >= 0) { // if tab exists in tabs[]
//         //log('updating tab order for', tabId, 'index', idx);
//         var tab = tabs[idx];
//         tabs.splice(idx, 1); // removes tab from old position = idx
//         tabs.unshift(tab); // adds tab to new position = beginning
//         activeTabsIndex = 0; // sync tabs[] pointer and actual current tab
// 
//       }
//       console.log({tabs})
//       // reset the badge color
//     }, 200)
// 
//   }
// 
// 
// 
// }

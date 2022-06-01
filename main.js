const minTabsOpen = 6;
const intervalInMs = 900000;

async function discardTabs() {
  let tabs = await browser.tabs.query({
    active: false, // Don't discard the current tab
    pinned: false, // Don't discard pinned tabs
  });

  tabs = tabs.sort(function (a, b) {
    return a.lastAccessed - b.lastAccessed;
  });

  if (minTabsOpen < tabs.length) {
    browser.tabs.remove(tabs[0].id);
  }

  //close all New Tabs after a few seconds (no time specifyed, because the active window will never close, so you can let it be open forever)
  tabs.forEach((tab) => {
    if (tab.title === "New Tab") {
      browser.tabs.remove(tab.id);
    }
  });
}

setInterval(discardTabs, intervalInMs);

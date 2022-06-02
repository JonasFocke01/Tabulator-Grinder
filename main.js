const defaultOptions = {
  tabsToKeepOpen: 6,
  closeNewTabs: true,
  frequency: 5000,
  discardAmount: 0,
};

async function grindTabs() {
  console.log("grindTabs");
  const userOptions = await browser.storage.sync.get();
  const options = {
    ...defaultOptions,
    ...userOptions,
  };
  let tabs = await browser.tabs.query({
    active: false, // Don't discard the current tab
    pinned: false, // Don't discard pinned tabs
    audible: false, // Don't discard audible tabs
  });

  tabs = tabs.sort(function (a, b) {
    return a.lastAccessed - b.lastAccessed;
  });

  if (discardAmount > 0) {
    for (let i = 0; i < discardAmount * tabs.length; i++) {
      browser.tabs.discard(tabs[i].id);
    }
  }

  if (options.tabsToKeepOpen < tabs.length) {
    browser.tabs.remove(tabs[0].id);
  }

  tabs.forEach((tab) => {
    if (options.closeNewTabs && tab.title === "New Tab") {
      browser.tabs.remove(tab.id);
    }
  });
  setTimeout(() => {
    grindTabs();
  }, options.frequency);
}

grindTabs();

const defaultOptions = {
  tabsToKeepOpen: 15,
  closeNewTabs: false,
  frequency: 3600000,
  discardAmount: 0,
  useDynamicFrequency: false,
  paused: false,
};

let windowId = 0;

async function grindTabs() {
  const browserStorage = await browser.storage.sync.get();
  const storage = {
    ...defaultOptions,
    ...browserStorage,
  };
  if (!storage.paused) {
    let tabs = await browser.tabs.query({
      active: false, // Don't discard the current tab
      pinned: false, // Don't discard pinned tabs
      audible: false, // Don't discard audible tabs
      currentWindow: true, //Only get tabs from the active window
    });

    //sort tab array
    tabs = tabs.sort((a, b) => {
      return a.lastAccessed - b.lastAccessed;
    });

    //close all New Tabs
    tabs.forEach((tab) => {
      if (storage.closeNewTabs && tab.title === 'New Tab') {
        browser.tabs.remove(tab.id);
      }
    });
    changeBadge(tabs[0].windowId);
    tabs = tabs.filter((t) => t.name !== 'New Tab');

    if (Date.now() > storage.nextRun) {
      browser.storage.sync.set({ lastRun: Date.now() });
      //discard tabs
      if (storage.discardAmount > 0) {
        for (let i = 0; i < storage.discardAmount * tabs.length; i++) {
          browser.tabs.discard(tabs[i].id);
        }
      }

      //close tabs
      if (storage.tabsToKeepOpen < tabs.length) {
        await browser.tabs.remove(tabs[0].id);
        changeBadge(tabs[0].windowId);
      }
    }

    //calculate next iteration
    let nextRun = storage.useDynamicFrequency
      ? nextIntervalLength(tabs.length, 1, 30, 1500000, 0) +
        Date.now() -
        (Date.now() - storage.lastRun)
      : storage.frequency + Date.now() - (Date.now() - storage.lastRun);

    browser.storage.sync.set({ nextRun });
  } else {
    let nextRun = Date.now() + 3600000;

    browser.storage.sync.set({ nextRun });
  }
  browser.runtime.sendMessage({
    type: 'updateText',
  });
}

function nextIntervalLength(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

setInterval(() => grindTabs(), 10000);

function handleMessage(message) {
  grindTabs();
}

async function changeBadge(e) {
  const tabs = await browser.tabs.query({
    currentWindow: true, //Only get tabs from the active window
    pinned: false,
  });

  if (e) {
    browser.browserAction.setBadgeText({
      text: tabs.length + '',
      windowId: e.windowId ?? e,
    });
    browser.browserAction.setBadgeBackgroundColor({ color: '#1ed84c' });
  }
}

browser.windows.onFocusChanged.addListener(changeBadge);
browser.tabs.onCreated.addListener(changeBadge);
browser.tabs.onRemoved.addListener(changeBadge);
browser.runtime.onMessage.addListener(handleMessage);

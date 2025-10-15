const defaultOptions = {
  tabsToKeepOpen: 15,
  closeNewTabs: false,
  frequency: 3600000,
  discardAmount: 0,
  useDynamicFrequency: false,
  paused: false,
};

let ginding = false;

async function grindTabs() {
  if (grinding) return;
  grinding = true;

  const browserStorage = await browser.storage.sync.get();
  const storage = {
    ...defaultOptions,
    ...browserStorage,
  };
  if (!storage.paused) {
    let tabs = await browser.tabs.query({
      currentWindow: true, //Only get tabs from the active window
    });

    //sort tab array
    tabs = tabs.sort((a, b) => {
      return a.lastAccessed - b.lastAccessed;
    });

    //close all New Tabs
    if (storage.closeNewTabs) {
      tabs.forEach((tab) => {
        if (tab.title === 'New Tab' && !tab.active && tab.lasAccessed + 20000 > Date.now()) {
          browser.tabs.remove(tab.id);
        }
      });
    }
    changeBadge(tabs[0].windowId);

    if (Date.now() > storage.nextRun) {
      browser.storage.sync.set({ lastRun: Date.now() });
      //discard tabs
      if (storage.discardAmount > 0) {
        for (let i = 0; i < storage.discardAmount * tabs.length; i++) {
          browser.tabs.discard(tabs[i].id);
        }
      }

      //close tab
      if (storage.tabsToKeepOpen < tabs.length) {
        await browser.tabs.remove(
          tabs.find(
            (el) =>
              !el.pinned && !el.audible && el.name !== 'New Tab' && !el.active
          ).id
        );
        changeBadge(tabs[0].windowId);
      }
    }

    //calculate next iteration
    let nextRun = storage.useDynamicFrequency
      ? nextIntervalLength(tabs.length, 1, 30, 2000000, 0) + storage.lastRun
      : storage.frequency + storage.lastRun;

    browser.storage.sync.set({ nextRun });

  } else {
    browser.storage.sync.set({ nextRun: Date.now() + 3600000 });
  }

  grinding = false;
}

function nextIntervalLength(x, in_min, in_max, out_min, out_max) {
    if (x < in_min) {
        out_min
    } else if (x > in_max) {
        out_max
    } else {
        ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    }
}

browser.tabs.onUpdated.addListener(grindTabs)
browser.tabs.onActivated.addListener(grindTabs)
browser.tabs.onRemoved.addListener(grindTabs)


function handleMessage() {
  grindTabs();
}

async function changeBadge(e) {
  const tabs = await browser.tabs.query({
    currentWindow: true, //Only get tabs from the active window
  });
  if (e) {
    let unpinnedTabs = tabs.filter((el) => !el.pinned).length;

    browser.browserAction.setBadgeText({
      text: unpinnedTabs,
      windowId: e.windowId ?? e,
    });

    const browserStorage = await browser.storage.sync.get();
    const storage = {
    ...defaultOptions,
    ...browserStorage,
    };

    let n = Math.max(storage.tabsToKeepOpen, Math.min(40, unpinnedTabs));

    let t = (n - storage.tabsToKeepOpen) / (40 - storage.tabsToKeepOpen);

    let r = Math.round(0 + t * (255 - 0));
    let g = Math.round(255 - t * (255 - 0));
    let b = 0;

    browser.browserAction.setBadgeBackgroundColor({ color: `rgb(${r},${g},${b})` });
  }
}

browser.windows.onFocusChanged.addListener(changeBadge);
browser.tabs.onCreated.addListener(changeBadge);
browser.tabs.onRemoved.addListener(changeBadge);
browser.runtime.onMessage.addListener(handleMessage);

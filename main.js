async function discardTabs() {
  const minTabsOpen = 12;
  const lastActiveLimit = Date.now() - options.time;

  let tabs = await browser.tabs.query({
    active: false, // Don't discard the current tab
    pinned: false,
    url: ["123", "456"],
  });

  tabs = tabs.filter(function (tab) {
    // TODO: how is the time working?
    if (tab.lastAccessed > lastActiveLimit) {
      return false;
    }

    return true;
  });

  for (const tab of tabs) {
    //   TODO: logic needs maintanence
    if (tabs.length > minTabsOpen) {
      browser.tabs.discard(tab.id);
    }
  }
}

// setInterval(discardTabs, 60000);

document.body.style.border = "5px solid red";

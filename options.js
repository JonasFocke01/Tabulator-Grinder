async function saveOptions(e) {
  e.preventDefault();

  const form = new FormData(document.querySelector("form"));

  const tabsToKeepOpen = Number(form.get("tabsToKeepOpen"));
  const closeNewTabs = form.get("closeNewTabs") === "on";
  const frequency = Number(form.get("frequency"));

  const options = {
    tabsToKeepOpen,
    closeNewTabs,
    frequency,
  };

  browser.storage.local.set(options);
}

async function loadOptions() {
  const options = await browser.storage.sync.get();
  document.querySelector("[name=tabsToKeepOpen]").checked =
    options.tabsToKeepOpen || false;
  document.querySelector("[name=closeNewTabs]").checked =
    options.closeNewTabs || false;
  document.querySelector("[name=frequency]").value =
    options.frequency || 3600000;

  const regexes = options.regexes || [];
  for (let regex of regexes) {
    addRegexInput(regex);
  }
}

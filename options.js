async function saveOptions(e) {
  e.preventDefault();

  const tabsToKeepOpen = Number(
    document.getElementById('tabsToKeepOpen').value
  );
  const closeNewTabs = document.getElementById('closeNewTabs').checked;
  const frequency = Number(document.getElementById('frequency').value);
  const discardAmount = Number(document.getElementById('discardAmount').value);
  const useDynamicFrequency =
    Number(document.getElementById('frequency').value) === 1 ? true : false;

  const options = {
    tabsToKeepOpen,
    closeNewTabs,
    frequency,
    discardAmount,
    useDynamicFrequency,
  };

  browser.storage.sync.set(options);
}

async function loadOptions() {
  const options = await browser.storage.sync.get();
  document.getElementById('tabsToKeepOpen').value =
    options.tabsToKeepOpen ?? 20;
  document.getElementById('closeNewTabs').checked = options.closeNewTabs;
  document.getElementById('frequency').value = options.frequency ?? "1";
  document.getElementById('discardAmount').value = options.discardAmount ?? "0.5";

  document.getElementById('nextIteration').innerText = !options.paused
    ? waitForRealNextRun()
    : 'Paused';
  document.getElementById('pause').textContent = options.paused
    ? 'Resume'
    : 'Pause';
}

async function waitForRealNextRun() {
  const storage = await browser.storage.sync.get();
  if (
    Math.floor(Math.abs(Date.now() - new Date(storage.nextRun)) / 1000 / 60) >
    55
  ) {
    setTimeout(() => {
      waitForRealNextRun();
    }, 1000);
  } else {
    document.getElementById('nextIteration').innerText =
      'Next run in ' +
      Math.floor(Math.abs(Date.now() - new Date(storage.nextRun)) / 1000 / 60) +
      ' minutes!';
  }
}

async function pauseGrind() {
  const options = await browser.storage.sync.get();
  options.paused = !options.paused;
  browser.storage.sync.set(options);
  loadOptions();
  browser.runtime.sendMessage({
    type: 'pauseGrind',
    paused: options.paused,
  });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document
  .getElementById('configuration')
  .addEventListener('submit', saveOptions);
document.getElementById('pause').addEventListener('click', pauseGrind);

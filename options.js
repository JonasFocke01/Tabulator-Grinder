async function saveOptions(e) {
  e.preventDefault();

  const form = new FormData(document.getElementById('myForm'));

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
    options.tabsToKeepOpen ?? 30;
  document.getElementById('closeNewTabs').checked = options.closeNewTabs;
  document.getElementById('frequency').value = options.frequency;
  document.getElementById('discardAmount').value = options.discardAmount;

  document.getElementById('nextIteration').innerText = !options.paused
    ? 'Next run in ' +
      Math.floor(Math.abs(Date.now() - new Date(options.nextRun)) / 1000 / 60) +
      ' minutes!'
    : 'Paused';
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

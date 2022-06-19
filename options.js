async function saveOptions(e) {
  e ? e.preventDefault() : null;

  // const form = new FormData(document.getElementById('myForm'));

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
  await saveOptions();
  const options = await browser.storage.sync.get();
  document.getElementById('tabsToKeepOpen').value =
    options.tabsToKeepOpen ?? 30;
  document.getElementById('closeNewTabs').checked = options.closeNewTabs;
  document.getElementById('frequency').value = options.frequency;
  document.getElementById('discardAmount').value = options.discardAmount;

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
    });
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

document.addEventListener('DOMContentLoaded', setRequiredInterval);
async function setRequiredInterval() {
  setInterval(loadOptions(), 1000);
}

document
  .getElementById('configuration')
  .addEventListener('submit', saveOptions);
document.getElementById('pause').addEventListener('click', pauseGrind);

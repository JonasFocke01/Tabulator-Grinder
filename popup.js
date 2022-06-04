async function loadOptions() {
  const options = await browser.storage.local.get();
  console.log(options);
  document.getElementById("nextIteration").innerText = options.nextRun;
}

document.addEventListener("DOMContentLoaded", loadOptions);

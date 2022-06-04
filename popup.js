async function loadOptions() {
  const options = await browser.storage.sync.get();
  console.log(options);
  document.getElementById("nextIteration").innerText = new Date(
    options.nextRun
  );
}

document.addEventListener("DOMContentLoaded", loadOptions);

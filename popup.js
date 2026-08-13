const DOMAIN = "doceru.com";
const POLL_MS = 1500;

const els = {
  loading: document.getElementById("state-loading"),
  waiting: document.getElementById("state-waiting"),
  found: document.getElementById("state-found"),
  wrongSite: document.getElementById("state-wrong-site"),
  input: document.getElementById("pdf-url"),
  copyBtn: document.getElementById("btn-copy"),
  openBtn: document.getElementById("btn-open"),
};

let pollTimer = null;
let hasCheckedOnce = false;

function showState(name) {
  ["loading", "waiting", "found", "wrongSite"].forEach((key) => {
    els[key].classList.toggle("hidden", key !== name);
  });
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function checkTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isTargetSite = tab?.url && new URL(tab.url).hostname.endsWith(DOMAIN);

    if (!isTargetSite) {
      showState("wrongSite");
      stopPolling();
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "GET_PDF_URL" }, (response) => {
      // chrome.runtime.lastError acontece quando o content script ainda não
      // foi injetado nessa aba (ex: página carregada antes da extensão).
      if (chrome.runtime.lastError || !response?.url) {
        showState(hasCheckedOnce ? "waiting" : "loading");
        hasCheckedOnce = true;
        return;
      }

      els.input.value = response.url;
      showState("found");
      stopPolling();
    });
  });
}

checkTab();
pollTimer = setInterval(checkTab, POLL_MS);
window.addEventListener("unload", stopPolling);

els.copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.input.value);
  els.copyBtn.textContent = "Copiado!";
  setTimeout(() => (els.copyBtn.textContent = "Copiar link"), 1200);
});

els.openBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: els.input.value });
});

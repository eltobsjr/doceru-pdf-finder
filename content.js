function findPdfUrl() {
  const el = document.querySelector("[data-pdf-url]");
  return el ? el.getAttribute("data-pdf-url") : null;
}

// A URL só existe no DOM depois que a pessoa passa manualmente pela
// verificação de robô e o preview do PDF carrega. Por isso não esperamos
// aqui: só respondemos com o que existe agora. Quem controla a espera
// (e tenta de novo) é o popup, enquanto estiver aberto.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "GET_PDF_URL") return false;
  sendResponse({ url: findPdfUrl() });
  return false;
});

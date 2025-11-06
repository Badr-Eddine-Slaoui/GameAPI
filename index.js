if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/GameAPI/service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("❌ SW registration failed:", err));
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../../service-worker.js")
      .then(() => {
        console.log("✅ Service Worker registered");
        window.location.href = "/api/games";
    })
    .catch((err) => console.error("❌ SW registration failed:", err));
}
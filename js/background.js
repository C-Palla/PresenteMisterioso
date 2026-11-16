/* Fundo vivo: bolhas coloridas flutuando por cima do degradê. */
(function () {
  "use strict";

  var container = document.getElementById("bg-blobs");
  if (!container) {
    return;
  }

  var COLORS = [
    "#ff5e5b",
    "#ff9f1c",
    "#ffe14d",
    "#3ddc97",
    "#23c4c4",
    "#ff77c8",
    "#ff3d81",
    "#ffcf3f"
  ];

  var BLOB_COUNT = 11;
  var MIN_SIZE_VW = 14;
  var MAX_SIZE_VW = 40;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  for (var i = 0; i < BLOB_COUNT; i += 1) {
    var blob = document.createElement("span");
    blob.className = "blob";

    var size = rand(MIN_SIZE_VW, MAX_SIZE_VW);
    var color = COLORS[i % COLORS.length];

    blob.style.width = size + "vw";
    blob.style.height = size + "vw";
    blob.style.left = rand(-10, 95) + "vw";
    blob.style.top = rand(-12, 92) + "vh";
    blob.style.background =
      "radial-gradient(circle at 35% 30%, " + color + " 0%, " + color + "88 55%, transparent 72%)";
    blob.style.setProperty("--dur", rand(14, 30).toFixed(1) + "s");
    blob.style.animationDelay = (-rand(0, 12)).toFixed(1) + "s";

    container.appendChild(blob);
  }
})();

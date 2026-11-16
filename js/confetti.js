/* Confete e faíscas do estouro. */
(function () {
  "use strict";

  var COLORS = [
    "#ff5e5b",
    "#ff9f1c",
    "#ffe14d",
    "#3ddc97",
    "#23c4c4",
    "#ff77c8",
    "#fff7ea",
    "#ff3d81"
  ];

  var layer = document.getElementById("confetti");

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function makePiece(fromTopOnly) {
    var piece = document.createElement("span");
    piece.className = "confetti__piece";

    var width = rand(7, 14).toFixed(1);
    var height = rand(9, 20).toFixed(1);

    piece.style.setProperty("--w", width + "px");
    piece.style.setProperty("--h", height + "px");
    piece.style.setProperty("--color", pick(COLORS));
    piece.style.setProperty("--radius", Math.random() > 0.68 ? "50%" : "2px");
    piece.style.setProperty("--drift", rand(-140, 140).toFixed(0) + "px");
    piece.style.setProperty("--spin", rand(240, 900).toFixed(0) + "deg");
    piece.style.setProperty("--dur", rand(1.9, 3.6).toFixed(2) + "s");
    piece.style.setProperty("--delay", rand(0, fromTopOnly ? 0.4 : 0.25).toFixed(2) + "s");
    piece.style.left = rand(0, 100).toFixed(2) + "vw";

    return piece;
  }

  function removeAfter(piece, ms) {
    window.setTimeout(function () {
      if (piece.parentNode) {
        piece.parentNode.removeChild(piece);
      }
    }, ms);
  }

  function rain(count) {
    if (!layer) {
      return;
    }
    var total = count || 40;
    for (var i = 0; i < total; i += 1) {
      var piece = makePiece(true);
      layer.appendChild(piece);
      removeAfter(piece, 4200);
    }
  }

  function sparkle(container, count) {
    if (!container) {
      return;
    }
    var total = count || 14;
    for (var i = 0; i < total; i += 1) {
      var dot = document.createElement("span");
      dot.className = "sparkle";

      var angle = (Math.PI * 2 * i) / total + rand(-0.25, 0.25);
      var distance = rand(70, 165);

      dot.style.setProperty("--size", rand(5, 13).toFixed(1) + "px");
      dot.style.setProperty("--color", pick(COLORS));
      dot.style.setProperty("--tx", (Math.cos(angle) * distance).toFixed(1) + "px");
      dot.style.setProperty("--ty", (Math.sin(angle) * distance).toFixed(1) + "px");
      dot.style.setProperty("--dur", rand(520, 900).toFixed(0) + "ms");
      dot.style.setProperty("--delay", rand(0, 90).toFixed(0) + "ms");

      container.appendChild(dot);
      removeAfter(dot, 1300);
    }
  }

  window.Confetti = {
    rain: rain,
    sparkle: sparkle
  };
})();

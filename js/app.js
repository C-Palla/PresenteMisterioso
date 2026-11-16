/* Lógica do jogo: 5 cliques por presente, 5 presentes, mensagem volta após 15s parado. */
(function () {
  "use strict";

  var TOTAL_GIFTS = 5;
  var CLICKS_PER_GIFT = 5;
  var IDLE_DELAY_MS = 15000;
  var MESSAGE_AUTO_HIDE_MS = 5000;
  var MIN_CLICK_GAP_MS = 110;
  var OPEN_ANIMATION_MS = 620;
  var POKE_ANIMATION_MS = 520;
  var APPEAR_ANIMATION_MS = 520;
  var PIPS_RESET_MS = 480;

  var giftButton = document.getElementById("gift");
  var giftHolder = document.getElementById("gift-svg");
  var sparkleLayer = document.getElementById("sparkles");
  var message = document.getElementById("message");
  var progress = document.getElementById("progress");
  var finale = document.getElementById("finale");
  var finaleTitle = document.getElementById("finale-title");
  var finaleSub = document.getElementById("finale-sub");
  var dogButton = document.getElementById("dog-button");
  var dogImage = dogButton.querySelector("img");
  var dogProgress = document.getElementById("dog-progress");

  var giftIndex = 0;
  var clickCount = 0;
  var dogClickCount = 0;
  var isOpening = false;
  var dogFinished = false;
  var lastClickAt = 0;
  var idleTimer = null;
  var hideTimer = null;
  var pokeTimer = null;
  var dogPromptTimer = null;

  /* ---------- presentes ---------- */

  function renderGift(index) {
    giftHolder.innerHTML = window.Gifts.markup(index);
    var palette = window.Gifts.palette(index);

    giftButton.setAttribute("aria-label", palette.name + " — abrir");
    giftButton.classList.remove("is-opening", "is-anticipating", "is-poked");
    giftButton.classList.add("is-appearing");

    window.setTimeout(function () {
      giftButton.classList.remove("is-appearing");
    }, APPEAR_ANIMATION_MS);
  }

  /* ---------- bolinhas de progresso ---------- */

  function buildPips() {
    progress.innerHTML = "";
    for (var i = 0; i < CLICKS_PER_GIFT; i += 1) {
      var pip = document.createElement("span");
      pip.className = "pip";
      progress.appendChild(pip);
    }
  }

  function fillPips(filled) {
    var pips = progress.children;
    for (var i = 0; i < pips.length; i += 1) {
      pips[i].classList.toggle("is-filled", i < filled);
    }
  }

  function resetPips() {
    progress.classList.add("is-rolling");
    window.setTimeout(function () {
      fillPips(0);
      progress.classList.remove("is-rolling");
    }, PIPS_RESET_MS);
  }

  /* ---------- mensagem ---------- */

  function hideMessage() {
    window.clearTimeout(hideTimer);
    message.classList.add("is-hidden");
  }

  function showMessage() {
    window.clearTimeout(hideTimer);
    message.classList.remove("is-back");
    // reflow para a animação poder rodar de novo
    void message.offsetWidth;
    message.classList.remove("is-hidden");
    message.classList.add("is-back");

    hideTimer = window.setTimeout(function () {
      message.classList.add("is-hidden");
    }, MESSAGE_AUTO_HIDE_MS);
  }

  function scheduleIdleMessage() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(function () {
      if (isOpening || !finale.hidden) {
        return;
      }
      showMessage();
    }, IDLE_DELAY_MS);
  }

  /* ---------- cliques ---------- */

  function poke() {
    window.clearTimeout(pokeTimer);
    giftButton.classList.remove("is-poked");
    void giftButton.offsetWidth;
    giftButton.classList.add("is-poked");

    pokeTimer = window.setTimeout(function () {
      giftButton.classList.remove("is-poked");
    }, POKE_ANIMATION_MS);
  }

  function openGift() {
    isOpening = true;
    giftButton.classList.remove("is-anticipating", "is-poked");
    giftButton.classList.add("is-opening");
    fillPips(CLICKS_PER_GIFT);
    window.Confetti.sparkle(sparkleLayer, 16);
    window.Confetti.rain(46);

    window.setTimeout(function () {
      giftIndex += 1;
      clickCount = 0;
      isOpening = false;

      if (giftIndex >= TOTAL_GIFTS) {
        showDogFound();
        return;
      }

      renderGift(giftIndex);
      resetPips();
      showMessage();
      scheduleIdleMessage();
    }, OPEN_ANIMATION_MS);
  }

  function handleClick() {
    var now = Date.now();
    if (isOpening || !finale.hidden) {
      return;
    }
    if (now - lastClickAt < MIN_CLICK_GAP_MS) {
      return;
    }
    lastClickAt = now;

    window.GiftSound.unlock();

    clickCount += 1;
    var isFinalClick = clickCount >= CLICKS_PER_GIFT;

    var isLastGift = giftIndex === TOTAL_GIFTS - 1;
    if (isFinalClick && isLastGift) {
      window.GiftSound.playDogCheer();
    } else {
      window.GiftSound.open({ strong: isFinalClick });
    }
    hideMessage();
    scheduleIdleMessage();

    if (!isFinalClick) {
      poke();
      fillPips(clickCount);
      window.Confetti.sparkle(sparkleLayer, 8);
      if (clickCount >= CLICKS_PER_GIFT - 2) {
        giftButton.classList.add("is-anticipating");
      }
      return;
    }

    openGift();
  }

  /* ---------- final ---------- */

  function showDogFound() {
    hideMessage();
    window.clearTimeout(idleTimer);
    finaleTitle.textContent = "Você encontrou o cachorro orelha!!!";
    finaleSub.textContent = "";
    dogProgress.textContent = "";
    dogButton.disabled = true;
    dogButton.classList.remove("is-shaking");
    finale.hidden = false;
    window.Confetti.rain(90);

    dogPromptTimer = window.setTimeout(function () {
      finaleTitle.textContent = "Faça carinho no cão orelha!!!";
      finaleSub.textContent = "Clique na foto 5 vezes.";
      dogButton.disabled = false;
      dogButton.classList.add("is-shaking");
      window.GiftSound.playDogAlarm();
    }, 5000);
  }

  function handleDogClick() {
    if (dogButton.disabled || dogFinished) {
      return;
    }

    window.GiftSound.unlock();
    dogClickCount += 1;
    dogProgress.textContent = "Carinho " + dogClickCount + " de " + CLICKS_PER_GIFT;

    if (dogClickCount < CLICKS_PER_GIFT) {
      return;
    }

    dogFinished = true;
    dogButton.disabled = true;
    dogButton.classList.remove("is-shaking");
    window.clearTimeout(dogPromptTimer);
    window.GiftSound.stopDogAlarm();
    dogImage.src = "assets/orelha-feliz.jpeg";
    dogImage.alt = "Cão Orelha em um helicóptero, ao lado de um piloto e de um pássaro amarelo";

    window.GiftSound.playDogCheer(function () {
      finaleTitle.textContent = "Você deixou o cão orelha muito feliz!!";
      finaleSub.textContent = "";
      dogProgress.textContent = "";
      window.GiftSound.playDogLoop();
    });
  }

  /* ---------- inicialização ---------- */

  message.addEventListener("animationend", function (event) {
    if (event.animationName === "message-pop") {
      message.classList.remove("is-back");
    }
  });

  giftButton.addEventListener("click", handleClick);
  dogButton.addEventListener("click", handleDogClick);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      scheduleIdleMessage();
    }
  });

  buildPips();
  renderGift(0);
  fillPips(0);
  showMessage();
  scheduleIdleMessage();
})();

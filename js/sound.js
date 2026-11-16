/* Sons de abertura das caixas e da sequência final do Cão Orelha. */
(function () {
  "use strict";

  // o primeiro arquivo é o som enviado pelo usuário (faixa de áudio do mp4),
  // o segundo é um mp3 CC0 que serve de reserva caso o navegador não toque o mp4
  var SOUND_SOURCES = ["assets/caixa-abrindo.mp4", "assets/caixa-abrindo.mp3"];
  var POOL_SIZE = 3;

  // o clipe é uma sequência de sons de caixa; entramos direto no primeiro
  // evento (0,28 s) e, no clique final, no segundo evento (1,36 s), que é mais forte
  var NORMAL_OFFSET = 0.28;
  var STRONG_OFFSET = 1.36;
  var NORMAL_LENGTH_MS = 720;
  var STRONG_LENGTH_MS = 760;

  var pool = [];
  var poolIndex = 0;
  var sourceIndex = 0;
  var isReady = false;
  var audioContext = null;
  var stopTimers = [];
  var dogCheer = createAudio(
    "sons/YTDown.com_YouTube_Media_9bnUWuAO0oU_FNAF-Kids-Cheering-Gaming-Sound-Effect-HD_007_48k (1).m4a"
  );
  var dogAlarm = createAudio(
    "sons/YTDown.com_YouTube_Media_9iyae89H2iM_Danger-Alarm-Meme-Sound-Effect_001_720p.mp4"
  );
  var dogLoop = createAudio(
    "sons/YTDown.com_YouTube_Media_PFdGk6T1394_Oliver-tree-remix-crédito-para-dj-helicóptero_001_720p.mp4"
  );

  dogCheer.preload = "auto";
  dogAlarm.preload = "auto";
  dogLoop.preload = "auto";

  function createAudio(src) {
    var audio = new Audio();
    audio.src = src;
    audio.preload = "auto";
    audio.volume = 0.85;
    return audio;
  }

  function buildPool() {
    pool = [];
    stopTimers = [];

    for (var i = 0; i < POOL_SIZE; i += 1) {
      pool.push(createAudio(SOUND_SOURCES[sourceIndex]));
      stopTimers.push(null);
    }

    pool[0].addEventListener("canplaythrough", function () {
      isReady = true;
    });

    pool[0].addEventListener("error", function () {
      isReady = false;
      if (sourceIndex < SOUND_SOURCES.length - 1) {
        sourceIndex += 1;
        buildPool();
      }
    });

    // força o carregamento no primeiro gesto do usuário
    pool[0].load();
  }

  function getContext() {
    if (audioContext) {
      return audioContext;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    audioContext = new Ctor();
    return audioContext;
  }

  /* "pop" curto: dá corpo ao som e funciona como reserva */
  function playPop(strength) {
    var ctx = getContext();
    if (!ctx) {
      return;
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16 * strength, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);

    // sopro de papelão: ruído filtrado bem curtinho
    var frames = Math.floor(ctx.sampleRate * 0.18);
    var buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frames; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 2.4);
    }

    var noise = ctx.createBufferSource();
    noise.buffer = buffer;

    var filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.18);
    filter.Q.value = 0.9;

    var noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.13 * strength, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    noise.connect(filter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);
  }

  function playOpen(options) {
    var settings = options || {};
    var strength = settings.strong ? 1.4 : 1;

    playPop(strength);

    if (!isReady || pool.length === 0) {
      return;
    }

    var slot = poolIndex;
    var audio = pool[slot];
    poolIndex = (poolIndex + 1) % pool.length;

    var isMp3 = audio.src.indexOf(".mp3") !== -1;
    var offset = 0;

    if (!isMp3) {
      offset = settings.strong ? STRONG_OFFSET : NORMAL_OFFSET;
    }

    var lengthMs = settings.strong ? STRONG_LENGTH_MS : NORMAL_LENGTH_MS;

    try {
      audio.currentTime = offset;
      audio.playbackRate = settings.strong ? 0.94 : 1;
      audio.volume = settings.strong ? 0.95 : 0.8;

      // corta a cauda para o som não se arrastar entre cliques
      window.clearTimeout(stopTimers[slot]);
      stopTimers[slot] = window.setTimeout(function () {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (error) {
          /* elemento ainda carregando */
        }
      }, lengthMs);

      var promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          /* autoplay bloqueado: o pop já tocou */
        });
      }
    } catch (error) {
      /* alguns navegadores reclamam de currentTime antes do load — ignoramos */
    }
  }

  function unlock() {
    // chamada no primeiro gesto para liberar o áudio no iOS/Safari
    if (!isReady) {
      pool.forEach(function (audio) {
        audio.load();
      });
    }
    var ctx = getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
  }

  function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  function reportPlaybackError(audio, error) {
    console.warn("Não foi possível reproduzir o áudio:", audio.src, error);
  }

  function playDogCheer(onEnded) {
    stopAudio(dogCheer);
    dogCheer.loop = false;

    var finished = false;
    function finish() {
      if (finished) {
        return;
      }
      finished = true;
      dogCheer.onended = null;
      dogCheer.onerror = null;
      if (onEnded) {
        onEnded();
      }
    }

    dogCheer.onended = finish;
    dogCheer.onerror = function () {
      reportPlaybackError(dogCheer, "falha ao carregar o arquivo");
      finish();
    };

    var playback = dogCheer.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        reportPlaybackError(dogCheer, error);
        finish();
      });
    }
  }

  function playDogAlarm() {
    stopAudio(dogAlarm);
    dogAlarm.loop = false;
    var playback = dogAlarm.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        reportPlaybackError(dogAlarm, error);
      });
    }
  }

  function stopDogAlarm() {
    stopAudio(dogAlarm);
  }

  function playDogLoop() {
    stopAudio(dogLoop);
    dogLoop.loop = true;
    var playback = dogLoop.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        reportPlaybackError(dogLoop, error);
      });
    }
  }

  buildPool();

  window.GiftSound = {
    unlock: unlock,
    open: playOpen,
    playDogCheer: playDogCheer,
    playDogAlarm: playDogAlarm,
    stopDogAlarm: stopDogAlarm,
    playDogLoop: playDogLoop,
    isReady: function () {
      return isReady;
    }
  };
})();

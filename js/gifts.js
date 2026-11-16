/* Presentes desenhados em SVG — um gerador com paletas trocáveis. */
(function () {
  "use strict";

  var VIEW_W = 300;
  var VIEW_H = 320;

  var PALETTES = [
    {
      id: "dourado",
      name: "Presente dourado com fita vermelha",
      body: { base: "#E3AE38", light: "#F9DA82", shadow: "#B4811A" },
      lid: { base: "#F0C451", light: "#FDE6A4", shadow: "#C58F22" },
      ribbon: { base: "#D5322E", light: "#F46962", shadow: "#981A19" },
      bow: { base: "#DA3A34", light: "#FF7F76", shadow: "#981A19" },
      pattern: null,
      hasRibbon: true,
      hasBow: true
    },
    {
      id: "vermelho",
      name: "Presente vermelho liso",
      body: { base: "#D42B3B", light: "#F35C6A", shadow: "#8F1327" },
      lid: { base: "#E13A49", light: "#FB7180", shadow: "#A0172B" },
      ribbon: null,
      bow: null,
      pattern: null,
      hasRibbon: false,
      hasBow: false
    },
    {
      id: "floral",
      name: "Presente floral rosa",
      body: { base: "#F2B4CA", light: "#FDD9E6", shadow: "#D180A3" },
      lid: { base: "#F7C6D8", light: "#FFE6EF", shadow: "#DE95B4" },
      ribbon: { base: "#E4659A", light: "#FFA3C6", shadow: "#B93B70" },
      bow: { base: "#F07CAC", light: "#FFBBD5", shadow: "#BE4C7C" },
      pattern: { petal: "#FFFFFF", center: "#E4659A", alpha: 0.88 },
      hasRibbon: true,
      hasBow: true
    },
    {
      id: "laco-branco",
      name: "Presente vermelho com laço branco",
      body: { base: "#CE2F3E", light: "#EF5F6C", shadow: "#8E1426" },
      lid: { base: "#DB3B4A", light: "#FA7A86", shadow: "#9B192B" },
      ribbon: { base: "#FFF3EA", light: "#FFFFFF", shadow: "#E0C4B8" },
      bow: { base: "#FFF8F1", light: "#FFFFFF", shadow: "#DFC3B7" },
      pattern: null,
      hasRibbon: true,
      hasBow: true
    },
    {
      id: "cinza",
      name: "Presente cinza com fita dourada",
      body: { base: "#D8D5D0", light: "#F4F2ED", shadow: "#A9A59E" },
      lid: { base: "#E4E1DC", light: "#FAF8F4", shadow: "#B5B1AA" },
      ribbon: { base: "#D9A32C", light: "#F8D473", shadow: "#A2750F" },
      bow: { base: "#E2B03C", light: "#FCE08C", shadow: "#A87A16" },
      pattern: null,
      hasRibbon: true,
      hasBow: true
    }
  ];

  function gradient(id, colors) {
    return (
      '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="' + colors.shadow + '"/>' +
      '<stop offset="0.18" stop-color="' + colors.light + '"/>' +
      '<stop offset="0.55" stop-color="' + colors.base + '"/>' +
      '<stop offset="0.92" stop-color="' + colors.base + '"/>' +
      '<stop offset="1" stop-color="' + colors.shadow + '"/>' +
      "</linearGradient>"
    );
  }

  function floralPattern(id, colors) {
    var flower =
      '<g fill="' + colors.petal + '" fill-opacity="' + colors.alpha + '">' +
      '<circle cx="0" cy="-6.4" r="4.4"/>' +
      '<circle cx="6.1" cy="-2" r="4.4"/>' +
      '<circle cx="3.8" cy="5.2" r="4.4"/>' +
      '<circle cx="-3.8" cy="5.2" r="4.4"/>' +
      '<circle cx="-6.1" cy="-2" r="4.4"/>' +
      "</g>" +
      '<circle cx="0" cy="0" r="2.6" fill="' + colors.center + '" fill-opacity="' + colors.alpha + '"/>';

    return (
      '<pattern id="' + id + '" width="38" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)">' +
      '<g transform="translate(9,10)">' + flower + "</g>" +
      '<g transform="translate(28,29) scale(0.78)">' + flower + "</g>" +
      "</pattern>"
    );
  }

  function bowMarkup(palette) {
    if (!palette.hasBow) {
      return "";
    }
    var b = palette.bow;
    return (
      '<g class="gift__bow">' +
      '<path d="M150 88 C120 38 76 40 82 68 C87 90 122 98 150 88 Z" fill="' + b.base + '"/>' +
      '<path d="M150 88 C180 38 224 40 218 68 C213 90 178 98 150 88 Z" fill="' + b.base + '"/>' +
      '<path d="M150 88 C126 52 96 52 98 70 C100 84 126 90 150 88 Z" fill="' + b.light + '" fill-opacity="0.55"/>' +
      '<path d="M150 88 C174 52 204 52 202 70 C200 84 174 90 150 88 Z" fill="' + b.light + '" fill-opacity="0.4"/>' +
      '<path d="M143 94 C139 112 129 124 116 133 L135 131 Z" fill="' + b.shadow + '"/>' +
      '<path d="M157 94 C161 112 171 124 184 133 L165 131 Z" fill="' + b.base + '"/>' +
      '<ellipse cx="150" cy="90" rx="15" ry="13" fill="' + b.base + '"/>' +
      '<ellipse cx="146" cy="86" rx="7" ry="5.5" fill="' + b.light + '" fill-opacity="0.7"/>' +
      "</g>"
    );
  }

  function ribbonMarkup(palette, uid) {
    if (!palette.hasRibbon) {
      return "";
    }
    var fill = "url(#ribbonGrad" + uid + ")";
    return (
      '<g class="gift__ribbon">' +
      '<path d="M134 106 L141 90 L159 90 L166 106 Z" fill="' + palette.ribbon.shadow + '"/>' +
      '<rect x="134" y="106" width="32" height="46" fill="' + fill + '"/>' +
      '<rect x="134" y="150" width="32" height="142" fill="' + fill + '"/>' +
      '<rect x="60" y="192" width="180" height="26" fill="' + fill + '"/>' +
      '<rect x="60" y="192" width="180" height="4" fill="' + palette.ribbon.light + '" fill-opacity="0.5"/>' +
      '<rect x="134" y="150" width="4" height="142" fill="' + palette.ribbon.light + '" fill-opacity="0.45"/>' +
      "</g>"
    );
  }

  function bodyMarkup(palette, uid) {
    var p = palette;
    return (
      '<g class="gift__body">' +
      '<rect x="60" y="150" width="180" height="142" rx="9" fill="url(#bodyGrad' + uid + ')"/>' +
      (p.pattern ? '<rect x="60" y="150" width="180" height="142" rx="9" fill="url(#floral' + uid + ')"/>' : "") +
      '<rect x="60" y="150" width="180" height="9" fill="#000" fill-opacity="0.08"/>' +
      '<rect x="60" y="150" width="10" height="142" fill="#000" fill-opacity="0.07"/>' +
      '<rect x="230" y="150" width="10" height="142" fill="#000" fill-opacity="0.09"/>' +
      '<rect x="60" y="284" width="180" height="8" rx="4" fill="#000" fill-opacity="0.12"/>' +
      "</g>"
    );
  }

  function lidMarkup(palette, uid) {
    var p = palette;
    return (
      '<g class="gift__lid">' +
      '<path d="M52 106 L70 88 L230 88 L248 106 Z" fill="' + p.lid.light + '"/>' +
      '<rect x="52" y="106" width="196" height="46" rx="9" fill="url(#lidGrad' + uid + ')"/>' +
      (p.pattern ? '<rect x="52" y="106" width="196" height="46" rx="9" fill="url(#floral' + uid + ')"/>' : "") +
      '<rect x="52" y="106" width="196" height="7" rx="3" fill="#fff" fill-opacity="0.22"/>' +
      '<rect x="52" y="144" width="196" height="8" rx="4" fill="#000" fill-opacity="0.14"/>' +
      "</g>"
    );
  }

  function buildSvg(palette, uid) {
    var defs =
      "<defs>" +
      gradient("bodyGrad" + uid, palette.body) +
      gradient("lidGrad" + uid, palette.lid) +
      (palette.ribbon ? gradient("ribbonGrad" + uid, palette.ribbon) : "") +
      (palette.pattern ? floralPattern("floral" + uid, palette.pattern) : "") +
      "</defs>";

    return (
      '<svg viewBox="0 0 ' + VIEW_W + " " + VIEW_H + '" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="' + palette.name + '">' +
      defs +
      bodyMarkup(palette, uid) +
      lidMarkup(palette, uid) +
      ribbonMarkup(palette, uid) +
      bowMarkup(palette) +
      "</svg>"
    );
  }

  window.Gifts = {
    count: PALETTES.length,
    palette: function (index) {
      return PALETTES[((index % PALETTES.length) + PALETTES.length) % PALETTES.length];
    },
    markup: function (index) {
      var safe = ((index % PALETTES.length) + PALETTES.length) % PALETTES.length;
      return buildSvg(PALETTES[safe], safe);
    }
  };
})();

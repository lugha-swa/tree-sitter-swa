// Sarufi ya Tree-sitter kwa lugha ya Swa.
//
// Chanzo cha ukweli kilichotumika kuandika sarufi hii (SI dhana):
//   - hati/vipimo-vya-lugha.md (lugha-swa/swa) -- sehemu 2 (leksia),
//     3 (aina), 4 (usemi/utangulizi), 5-8 (kazi/taarifa/miundo/husisha).
//   - msingi/mkusanyaji/msomaji.swa -- ni_neno_muhimu (maneno muhimu
//     HALISI ya kileksia: kwa, kama, hali, fanya, sivyo, tenga, acha,
//     wakati, muundo, chagua, achilia, rudisha, husisha, endelea --
//     tenga NI neno muhimu licha ya hati kudai vinginevyo, imethibitishwa
//     kwa kusoma chanzo cha msomaji moja kwa moja).
//   - msingi/mkusanyaji/msambazaji.swa -- ni_aina_msingi/changanua_aina_tokeni
//     (aina za msingi: familia [n|a|d|b|w] (herufi ndogo, kipendwa tangu
//     lugha-swa/swa#225) AU [N|A|D|B|W] (herufi kubwa, bado inakubalika,
//     aina MOJA HASA -- N32 na n32 ni sawa kabisa) ikifuatiwa na tarakimu).
//   - jaribio_k11a_maoni_ya_kijiuzi.swa -- uthibitisho kuwa maoni ya
//     /* */ YANAWEZA kupachikana (nested) kwenye mnyororo wa uzalishaji
//     (kamili) -- tofauti na C, ambako haiwezekani.

module.exports = grammar({
  name: "swa",

  extras: ($) => [/\s/, $.maoni],

  word: ($) => $.kitambulisho,

  // MUHIMU: `Jina* x;` (tangazo la kielekezi) na `x * y;` (usemi wa
  // kuzidisha) hazitofautiani kisintaksia kwa herufi chache za kwanza
  // -- lugha halisi inatatua hili kwa jedwali la majina ya miundo
  // (angalia ni_jina_la_aina kwenye msambazaji.swa), jambo ambalo
  // sarufi ya context-free ya tree-sitter haiwezi kufanya moja kwa
  // moja. Kwa madhumuni ya syntax highlighting (SI ukusanyaji halisi),
  // tunapendelea kusoma kama TANGAZO wakati mkanganyiko unatokea --
  // sawa na jinsi tree-sitter-c inavyoshughulikia mkanganyiko uleule
  // wa "typedef name" dhidi ya kuzidisha.
  conflicts: ($) => [
    [$._aina_ya_msingi, $._usemi],
    [$._usemi, $.orodha_ya_hoja],
  ],

  rules: {
    programu: ($) => repeat($._kipengele_cha_juu),

    _kipengele_cha_juu: ($) =>
      choice(
        $.tangazo_la_husisha,
        $.tangazo_la_muundo,
        $.tangazo_la_kazi,
        $.tangazo_la_mbele,
        $.tangazo_la_ulimwengu,
        $.tangazo_la_nje,
      ),

    // -----------------------------------------------------------
    // husisha { faili.swa }  (Swa haina kiungo cha C: husisha C:: ni kosa)
    // -----------------------------------------------------------
    tangazo_la_husisha: ($) =>
      seq("husisha", "{", field("njia", $.njia_ya_husisha), "}"),

    // Njia ya faili: kitambulisho/kitambulisho.swa -- inaruhusu '/' na
    // '.', pamoja na njia za jamaa (../../msingi/...) zinazotumika
    // HALISI kwenye majaribio ya maendeleo (majaribio/msambazaji/*.swa).
    njia_ya_husisha: (_) => /[a-zA-Z_.][a-zA-Z0-9_./-]*/,

    // -----------------------------------------------------------
    // muundo Jina { sehemu*; };
    // -----------------------------------------------------------
    // MUHIMU: ';' ya mwisho baada ya '}' ni ya HIARI kwa vitendo --
    // hati/vipimo-vya-lugha.md 7 na msimbo halisi wa Dominion
    // huandika kwa ';', lakini jaribio_k13_anwani_sehemu_kupitia_
    // kielekezi_kama_hoja.swa (jaribio linalotarajiwa kufaulu, si
    // KATA) linaiacha na bado linakusanya/kuendesha sahihi.
    tangazo_la_muundo: ($) =>
      seq(
        "muundo",
        field("jina", $.kitambulisho),
        field("maudhui", $.orodha_ya_sehemu),
        optional(";"),
      ),

    orodha_ya_sehemu: ($) =>
      seq("{", repeat($.tangazo_la_sehemu), "}"),

    tangazo_la_sehemu: ($) =>
      seq(
        field("aina", $._aina),
        field("jina", $.kitambulisho),
        optional(seq("[", field("ukubwa", $._usemi), "]")),
        ";",
      ),

    // -----------------------------------------------------------
    // <aina> <jina>(<vigezo>) { <mwili> }
    // -----------------------------------------------------------
    tangazo_la_kazi: ($) =>
      seq(
        field("aina_ya_kurudi", $._aina),
        field("jina", $.kitambulisho),
        field("vigezo", $.orodha_ya_vigezo),
        field("maudhui", $.ubeti),
      ),

    // Tangazo la mbele (forward declaration) -- saini pekee, bila
    // mwili, ikiishia kwa ';'. Halisi kwenye chanzo cha mkusanyaji
    // mwenyewe (msambazaji.swa) kwa vitenzi-njia vinavyojirudiana
    // (mutual recursion) kati ya kazi za uchanganuzi.
    tangazo_la_mbele: ($) =>
      seq(
        field("aina_ya_kurudi", $._aina),
        field("jina", $.kitambulisho),
        field("vigezo", $.orodha_ya_vigezo),
        ";",
      ),

    orodha_ya_vigezo: ($) =>
      seq("(", commaSep($.kigezo), ")"),

    kigezo: ($) =>
      seq(field("aina", $._aina), field("jina", $.kitambulisho)),

    // -----------------------------------------------------------
    // Kiolesura cha mashine (hati/kiolesura-cha-mashine.md):
    //   nje "libm.so.6" { d64 kosini(d64 pembe) = "cos"; }
    //   nje "js" { n32 kiwango = "kiwango"; }
    // Jina la Kiswahili upande wa kushoto; alama ya maktaba (data yao) ni
    // mfuatano upande wa kulia. "..." ni hoja za ziada za kazi ya C.
    // -----------------------------------------------------------
    tangazo_la_nje: ($) =>
      seq(
        "nje",
        field("maktaba", $.mfuatano),
        "{",
        repeat(choice($.kazi_ya_nje, $.data_ya_nje)),
        "}",
      ),

    kazi_ya_nje: ($) =>
      seq(
        field("aina_ya_kurudi", $._aina),
        field("jina", $.kitambulisho),
        field("vigezo", $.orodha_ya_vigezo_ya_nje),
        optional(seq("=", field("alama", $.mfuatano))),
        ";",
      ),

    data_ya_nje: ($) =>
      seq(
        field("aina", $._aina),
        field("jina", $.kitambulisho),
        optional(seq("=", field("alama", $.mfuatano))),
        ";",
      ),

    orodha_ya_vigezo_ya_nje: ($) =>
      seq("(", commaSep(choice($.kigezo, $.hoja_za_ziada)), ")"),

    hoja_za_ziada: (_) => "...",

    // -----------------------------------------------------------
    // Kigezo cha ulimwengu: <aina> <jina> = <usemi>; au safu
    // -----------------------------------------------------------
    tangazo_la_ulimwengu: ($) =>
      seq(
        field("aina", $._aina),
        field("jina", $.kitambulisho),
        optional(seq("[", field("ukubwa", $._usemi), "]")),
        optional(seq("=", field("thamani", $._usemi))),
        ";",
      ),

    // -----------------------------------------------------------
    // Aina: [n|a|d|b|w][0-9]+ (herufi ndogo au kubwa), T*, T[n], muundo
    // -----------------------------------------------------------
    _aina: ($) => seq($._aina_ya_msingi, repeat("*")),

    _aina_ya_msingi: ($) => choice($.aina_ya_msingi, $.kitambulisho),

    // MUHIMU: upana halisi TU (8/16/32/64 kwa n/a; 1/8/16/32/64 kwa b;
    // 32/64 kwa d; 0/8/16/32/64 kwa w -- angalia hati/vipimo-vya-lugha.md
    // sehemu ya 3) -- SI mfuatano wowote wa tarakimu. Ukiruhusu tarakimu
    // yoyote (mfano "a1", "a3"), kingekutana na vitambulisho HALISI vya
    // kawaida vinavyolingana muundo huo (mfano "a1"/"b1" hutumika kama
    // majina ya kawaida ya vigezo kwenye msingi/mkusanyaji/uzalishaji.swa
    // -- iligunduliwa kwa jaribio la moja kwa moja dhidi ya
    // majaribio/programu/jaribio_k14_maktaba_zaidi.swa). Kuzuia kwa
    // upana HALISI TU kunaondoa mgongano kwa karibu visa vyote (a1/a2/
    // a3/a5.../n1/n2.../d1-d31/d33-d63/w1-w7/w9-w15... havitakuwa
    // aina_ya_msingi kamwe) -- b1 pekee inabaki mgongano wa kweli
    // (b1 NI upana sahihi kwa familia B, boolean), inayotatuliwa na
    // dynamic precedence ya tangazo_la_ndani (angalia chini).
    aina_ya_msingi: (_) =>
      /n(8|16|32|64)|a(8|16|32|64)|b(1|8|16|32|64)|d(32|64)|w(0|8|16|32|64)/,

    // -----------------------------------------------------------
    // Taarifa (statements)
    // -----------------------------------------------------------
    ubeti: ($) => seq("{", repeat($._taarifa), "}"),

    _taarifa: ($) =>
      choice(
        $.ubeti,
        $.taarifa_ya_kama,
        $.taarifa_ya_wakati,
        $.taarifa_ya_kwa,
        $.taarifa_ya_fanya,
        $.taarifa_ya_chagua,
        $.taarifa_ya_rudisha,
        $.taarifa_ya_acha,
        $.taarifa_ya_endelea,
        $.tangazo_la_ndani,
        $.taarifa_ya_achilia,
        $.taarifa_ya_usemi,
        $.taarifa_tupu,
      ),

    // achilia <kielekezi>; -- neno muhimu la lugha (si kazi
    // inayoweza kuandikwa upya) linaloachilia kumbukumbu ya
    // kielekezi. Iligunduliwa kama pengo halisi la sarufi wakati
    // wa kujaribu dhidi ya msimbo halisi wa Dominion (achilia
    // eng->wakala_wote;).
    taarifa_ya_achilia: ($) =>
      seq("achilia", field("operanda", $._usemi), ";"),

    // Taarifa tupu -- ';' peke yake (semantiki ya C, halali kwenye
    // mnyororo wa uzalishaji -- jaribio_hitilafu_kazi_mwili_nukta.swa,
    // "N32 f() { ; }" inatarajiwa kufaulu).
    taarifa_tupu: (_) => ";",

    taarifa_ya_kama: ($) =>
      prec.right(
        seq(
          "kama",
          "(",
          field("sharti", $._usemi),
          ")",
          field("basi", $._taarifa),
          optional(seq("sivyo", field("sivyo", $._taarifa))),
        ),
      ),

    taarifa_ya_wakati: ($) =>
      seq(
        "wakati",
        "(",
        field("sharti", $._usemi),
        ")",
        field("maudhui", $._taarifa),
      ),

    taarifa_ya_kwa: ($) =>
      seq(
        "kwa",
        "(",
        field("kianzio", optional($._kifungu_cha_kwa)),
        ";",
        field("sharti", optional($._usemi)),
        ";",
        field("hatua", optional($._usemi)),
        ")",
        field("maudhui", $._taarifa),
      ),

    _kifungu_cha_kwa: ($) => choice($._usemi, $._tangazo_la_ndani_tupu),

    // Tangazo la kigezo ndani ya kichwa cha kwa (bila ';' ya mwisho)
    _tangazo_la_ndani_tupu: ($) =>
      seq(
        field("aina", $._aina),
        field("jina", $.kitambulisho),
        optional(seq("=", field("thamani", $._usemi))),
      ),

    taarifa_ya_fanya: ($) =>
      seq(
        "fanya",
        field("maudhui", $.ubeti),
        "wakati",
        "(",
        field("sharti", $._usemi),
        ")",
        ";",
      ),

    taarifa_ya_chagua: ($) =>
      seq(
        "chagua",
        "(",
        field("thamani", $._usemi),
        ")",
        "{",
        repeat($.hali),
        "}",
      ),

    hali: ($) =>
      choice(
        seq("hali", field("thamani_ya_hali", $._usemi), ":", repeat($._taarifa)),
        seq("sivyo", ":", repeat($._taarifa)),
      ),

    taarifa_ya_rudisha: ($) =>
      seq("rudisha", optional(field("thamani", $._usemi)), ";"),

    // acha ("simama, acha"): toka kwenye mzunguko
    taarifa_ya_acha: (_) => seq("acha", ";"),

    taarifa_ya_endelea: (_) => seq("endelea", ";"),

    tangazo_la_ndani: ($) =>
      prec.dynamic(
        1,
        seq(
          field("aina", $._aina),
          $.jina_linalotangazwa,
          repeat(seq(",", $.jina_linalotangazwa)),
          ";",
        ),
      ),

    jina_linalotangazwa: ($) =>
      seq(
        field("jina", $.kitambulisho),
        optional(seq("[", field("ukubwa", $._usemi), "]")),
        optional(seq("=", field("thamani", $._usemi))),
      ),

    taarifa_ya_usemi: ($) => seq($._usemi, ";"),

    // -----------------------------------------------------------
    // Usemi -- utangulizi kutoka hati/vipimo-vya-lugha.md sehemu 4
    // (kina 12 juu kabisa hadi 1 chini kabisa, ugawi ni wa kulia,
    // vingine vyote ni vya kushoto):
    //   12: * / %   11: + -   10: << >>   9: < > <= >=   8: == !=
    //   7: &   6: ^   5: |   4: &&   3: ||   2: ?:   1: =
    // -----------------------------------------------------------
    _usemi: ($) =>
      choice(
        $.ugawaji,
        $.usemi_wa_masharti,
        $.usemi_wa_pande_mbili,
        $.usemi_wa_upande_mmoja,
        $.wito,
        $.usemi_wa_sehemu,
        $.usemi_wa_fahirisi,
        $.usemi_wa_anwani,
        $.usemi_wa_kufikia,
        $.usemi_wa_mabano,
        $.kitambulisho,
        // jina la aina ni kitambulisho mahali ambapo aina haitarajiwi
        // (b1 = b1 + 1; -- jaribio_herufi_ndogo_kitambulisho_sio_aina)
        alias($.aina_ya_msingi, $.kitambulisho),
        $.nambari,
        $.mfuatano,
      ),

    // MUHIMU: += -= *= /= %= &= |= ^= <<= >>= zote zinafanya kazi
    // HALISI kwenye kamili (jaribio_hitilafu_18_kiwanja_biti.swa, "0" =
    // inapita) -- hati/vipimo-vya-lugha.md 2.5 (orodha ya ishara)
    // IMEPITWA NA WAKATI, haitaji hizi, lakini chanzo halisi/jaribio
    // linathibitisha zinatumika kikamilifu.
    ugawaji: ($) =>
      prec.right(
        1,
        seq(
          field("kushoto", $._usemi),
          field(
            "operator",
            choice(
              "=",
              "+=",
              "-=",
              "*=",
              "/=",
              "%=",
              "&=",
              "|=",
              "^=",
              "<<=",
              ">>=",
            ),
          ),
          field("kulia", $._usemi),
        ),
      ),

    usemi_wa_masharti: ($) =>
      prec.right(
        2,
        seq(
          field("sharti", $._usemi),
          "?",
          field("basi", $._usemi),
          ":",
          field("sivyo", $._usemi),
        ),
      ),

    usemi_wa_pande_mbili: ($) => {
      const table = [
        [3, "||"],
        [4, "&&"],
        [5, "|"],
        [6, "^"],
        [7, "&"],
        [8, choice("==", "!=")],
        [9, choice("<", ">", "<=", ">=")],
        [10, choice("<<", ">>")],
        [11, choice("+", "-")],
        [12, choice("*", "/", "%")],
      ];
      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            precedence,
            seq(
              field("kushoto", $._usemi),
              field("mwendeshaji", operator),
              field("kulia", $._usemi),
            ),
          ),
        ),
      );
    },

    usemi_wa_upande_mmoja: ($) =>
      prec(
        13,
        seq(field("mwendeshaji", choice("!", "~", "-")), field("operanda", $._usemi)),
      ),

    usemi_wa_anwani: ($) =>
      prec(13, seq("&", field("operanda", $._usemi))),

    usemi_wa_kufikia: ($) =>
      prec(13, seq("*", field("operanda", $._usemi))),

    wito: ($) =>
      prec(
        14,
        seq(
          field("kazi", $._usemi),
          field("hoja", $.orodha_ya_hoja),
        ),
      ),

    // MUHIMU: ukubwa(AINA) na urefu(kigezo) ni kazi za KAWAIDA (SI
    // maneno muhimu -- kuzifanya "keyword-like" literals kwenye
    // sarufi hii KULIVUNJA uchanganuzi wa msambazaji.swa halisi,
    // kwa sababu tree-sitter huchukua neno lolote la herufi
    // lililoandikwa moja kwa moja (bila token()) kama neno muhimu
    // lenye kipaumbele zaidi ya kitambulisho -- na "urefu"
    // ni jina la kawaida la kigezo (maana yake ni urefu wa kitu)
    // linalotumika mahali pengi kama thamani ya kawaida, si kama
    // wito wa kazi hii. Badala yake, hoja ya kwanza ya wito WOWOTE
    // inaruhusiwa kuwa jina la aina la msingi moja kwa moja (mfano
    // "n32" kwenye ukubwa(n32)) -- hii ni uwezekano wa kisintaksia
    // tu, si ukaguzi wa kisemantiki wa jina la kazi (huo ni kazi ya
    // mkusanyaji, si ya sarufi hii ya highlighting).
    orodha_ya_hoja: ($) =>
      seq("(", commaSep(choice($._usemi, $.aina_ya_msingi)), ")"),

    usemi_wa_sehemu: ($) =>
      prec(
        14,
        seq(
          field("kitu", $._usemi),
          field("mwendeshaji", choice(".", "->")),
          field("sehemu", $.kitambulisho),
        ),
      ),

    usemi_wa_fahirisi: ($) =>
      prec(
        14,
        seq(
          field("kitu", $._usemi),
          "[",
          field("fahirisi", $._usemi),
          "]",
        ),
      ),

    usemi_wa_mabano: ($) => seq("(", $._usemi, ")"),

    // -----------------------------------------------------------
    // Vitambulisho, herufi/nambari, mfuatano, maoni
    // (hati/vipimo-vya-lugha.md 2.1: a-z, A-Z, _ mwanzoni; tarakimu
    // baadaye)
    // -----------------------------------------------------------
    kitambulisho: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    nambari: (_) => /[0-9]+(\.[0-9]+)?/,

    // MUHIMU: mfuatano LAZIMA uwe tokeni MOJA HALISI (token()), si
    // mfululizo wa tokeni ndogo -- vinginevyo msomaji wa tree-sitter
    // ingejaribu kulinganisha herufi/maneno ndani ya mfuatano (mfano
    // "HITILAFU" ndani ya `andika_kosa("; DEB: HITILAFU ...")`)
    // dhidi ya sheria za kitambulisho/neno-muhimu badala ya kuzisoma
    // kama sehemu ya mfuatano -- iligunduliwa kwa jaribio HALISI
    // dhidi ya msambazaji.swa halisi (mfuatano zenye maneno ya
    // Kiingereza kama HITILAFU/DEB ndani yake zilivunja uchanganuzi).
    // \% pia ni utorokaji halisi (hati/uthibitisho-wa-lugha.md 8.2,
    // jaribio_t94_asilimia_utorokaji.swa) -- si \n/\\/\t/\" tu.
    mfuatano: (_) =>
      token(seq('"', repeat(choice(/\\[n\\t"%]/, /[^"\\\n]/)), '"')),

    maoni: (_) =>
      token(
        choice(
          seq("//", /.*/),
          // Maoni ya /* */ yanaweza kupachikana (nested) kwenye
          // mnyororo wa uzalishaji (kamili) -- imethibitishwa na
          // jaribio_k11a_maoni_ya_kijiuzi.swa (KINA CHA 3: "/* a /* b
          // /* c */ */ d */"). `token()` ya tree-sitter haiwezi
          // kuwakilisha upachikaji wa KWELI usio na mpaka kwa regex --
          // hiyo ingehitaji kichunguzi cha nje (scanner.c; kazi ya baadaye halisi,
          // nje ya wigo wa toleo hili la kwanza). Sarufi hii badala
          // yake inaunga mkono kina hadi 4 kwa mkono (zaidi ya jaribio
          // pekee lililopo -- nafasi ya ziada) -- upachikaji wa kina
          // zaidi ya hapo utaonekana kama hitilafu ya uchanganuzi
          // (KIKOMO KINACHOJULIKANA, kimeandikwa hapa kwa makusudi).
          _nestedComment(0),
        ),
      ),
  },
});

function commaSep(rule) {
  return optional(seq(rule, repeat(seq(",", rule))));
}

// Jenereta ya muundo wa maoni ya /* */ yanayoweza kupachikana hadi
// kina cha 4 -- angalia maelezo kamili karibu na mahali panapotumika
// (kazi ya "maoni" kwenye rules). Nambari 4 imeandikwa moja kwa
// moja (SI `const` iliyotenganishwa) kwa sababu grammar() inaita kazi
// hii MARA MOJA wakati faili linapopakiwa, kabla ya `const` yoyote
// iliyotangazwa BAADAYE kwenye faili kupatikana (TDZ ya JavaScript).
function _nestedComment(depth) {
  if (depth >= 4) {
    return seq("/*", repeat(/[^*/]|\*[^/]|\/[^*]/), "*/");
  }
  return choice(
    seq("/*", repeat(/[^*/]|\*[^/]|\/[^*]/), "*/"),
    seq(
      "/*",
      repeat(/[^*/]|\*[^/]|\/[^*]/),
      _nestedComment(depth + 1),
      repeat(/[^*/]|\*[^/]|\/[^*]/),
      "*/",
    ),
  );
}

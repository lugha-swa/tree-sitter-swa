// Sarufi ya Tree-sitter kwa lugha ya Swa.
//
// Chanzo cha ukweli kilichotumika kuandika sarufi hii (SI dhana):
//   - hati/vipimo-vya-lugha.md (lugha-swa/swa) -- sehemu 2 (leksia),
//     3 (aina), 4 (usemi/utangulizi), 5-8 (kazi/taarifa/miundo/husisha).
//   - msingi/mkusanyaji/msomaji.swa -- ni_neno_muhimu (maneno muhimu
//     HALISI ya kileksia: kwa, kama, hali, fanya, sivyo, tenga, vunja,
//     wakati, muundo, chagua, achilia, rudisha, husisha, endelea --
//     tenga NI neno muhimu licha ya hati kudai vinginevyo, imethibitishwa
//     kwa kusoma chanzo cha lexer moja kwa moja).
//   - msingi/mkusanyaji/msambazaji.swa -- ni_aina_msingi/changanua_aina_tokeni
//     (aina za msingi: familia [n|a|d|b|w] (herufi ndogo, kipendwa tangu
//     lugha-swa/swa#225) AU [N|A|D|B|W] (herufi kubwa, bado inakubalika,
//     aina MOJA HASA -- N32 na n32 ni sawa kabisa) ikifuatiwa na tarakimu).
//   - jaribio_k11a_maoni_ya_kijiuzi.swa -- uthibitisho kuwa maoni ya
//     /* */ YANAWEZA kupachikana (nested) kwenye mnyororo wa uzalishaji
//     (stage1) -- tofauti na C, ambako haiwezekani.

module.exports = grammar({
  name: "swa",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

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
    [$._base_type, $._expression],
  ],

  rules: {
    source_file: ($) => repeat($._top_level_item),

    _top_level_item: ($) =>
      choice(
        $.husisha_declaration,
        $.struct_declaration,
        $.function_declaration,
        $.function_prototype,
        $.global_variable_declaration,
      ),

    // -----------------------------------------------------------
    // husisha { faili.swa }  /  husisha C::jina
    // -----------------------------------------------------------
    husisha_declaration: ($) =>
      choice(
        seq("husisha", "{", field("path", $.husisha_path), "}"),
        seq("husisha", field("c_link", $.c_link)),
      ),

    // Njia ya faili: kitambulisho/kitambulisho.swa -- inaruhusu '/' na
    // '.', pamoja na njia za jamaa (../../msingi/...) zinazotumika
    // HALISI kwenye majaribio ya maendeleo (majaribio/msambazaji/*.swa).
    husisha_path: (_) => /[a-zA-Z_.][a-zA-Z0-9_./-]*/,

    c_link: (_) => /C::[a-zA-Z_][a-zA-Z0-9_]*/,

    // -----------------------------------------------------------
    // muundo Jina { sehemu*; };
    // -----------------------------------------------------------
    // MUHIMU: ';' ya mwisho baada ya '}' ni ya HIARI kwa vitendo --
    // hati/vipimo-vya-lugha.md 7 na msimbo halisi wa Dominion
    // huandika kwa ';', lakini jaribio_k13_anwani_sehemu_kupitia_
    // kielekezi_kama_hoja.swa (jaribio linalotarajiwa kufaulu, si
    // KATA) linaiacha na bado linakusanya/kuendesha sahihi.
    struct_declaration: ($) =>
      seq(
        "muundo",
        field("name", $.identifier),
        field("body", $.field_declaration_list),
        optional(";"),
      ),

    field_declaration_list: ($) =>
      seq("{", repeat($.field_declaration), "}"),

    field_declaration: ($) =>
      seq(
        field("type", $._type),
        field("name", $.identifier),
        optional(seq("[", field("size", $._expression), "]")),
        ";",
      ),

    // -----------------------------------------------------------
    // <aina> <jina>(<vigezo>) { <mwili> }
    // -----------------------------------------------------------
    function_declaration: ($) =>
      seq(
        field("return_type", $._type),
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        field("body", $.block),
      ),

    // Tangazo la mbele (forward declaration) -- saini pekee, bila
    // mwili, ikiishia kwa ';'. Halisi kwenye chanzo cha mkusanyaji
    // mwenyewe (msambazaji.swa) kwa vitenzi-njia vinavyojirudiana
    // (mutual recursion) kati ya kazi za uchanganuzi.
    function_prototype: ($) =>
      seq(
        field("return_type", $._type),
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        ";",
      ),

    parameter_list: ($) =>
      seq("(", commaSep($.parameter), ")"),

    parameter: ($) =>
      seq(field("type", $._type), field("name", $.identifier)),

    // -----------------------------------------------------------
    // Kigezo cha ulimwengu: <aina> <jina> = <usemi>; au safu
    // -----------------------------------------------------------
    global_variable_declaration: ($) =>
      seq(
        field("type", $._type),
        field("name", $.identifier),
        optional(seq("[", field("size", $._expression), "]")),
        optional(seq("=", field("value", $._expression))),
        ";",
      ),

    // -----------------------------------------------------------
    // Aina: [n|a|d|b|w][0-9]+ (herufi ndogo au kubwa), T*, T[n], muundo
    // -----------------------------------------------------------
    _type: ($) => seq($._base_type, repeat("*")),

    _base_type: ($) => choice($.primitive_type, $.identifier),

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
    // primitive_type kamwe) -- b1 pekee inabaki mgongano wa kweli
    // (b1 NI upana sahihi kwa familia B, boolean), inayotatuliwa na
    // dynamic precedence ya local_variable_declaration (angalia chini).
    primitive_type: (_) =>
      /[nN](8|16|32|64)|[aA](8|16|32|64)|[bB](1|8|16|32|64)|[dD](32|64)|[wW](0|8|16|32|64)/,

    // -----------------------------------------------------------
    // Taarifa (statements)
    // -----------------------------------------------------------
    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.block,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.do_while_statement,
        $.switch_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
        $.local_variable_declaration,
        $.achilia_statement,
        $.expression_statement,
        $.empty_statement,
      ),

    // achilia <kielekezi>; -- neno muhimu la lugha (si kazi
    // inayoweza kuandikwa upya) linaloachilia kumbukumbu ya
    // kielekezi. Iligunduliwa kama pengo halisi la sarufi wakati
    // wa kujaribu dhidi ya msimbo halisi wa Dominion (achilia
    // eng->wakala_wote;).
    achilia_statement: ($) =>
      seq("achilia", field("operand", $._expression), ";"),

    // Taarifa tupu -- ';' peke yake (semantiki ya C, halali kwenye
    // mnyororo wa uzalishaji -- jaribio_mende_kazi_mwili_nukta.swa,
    // "N32 f() { ; }" inatarajiwa kufaulu).
    empty_statement: (_) => ";",

    if_statement: ($) =>
      prec.right(
        seq(
          "kama",
          "(",
          field("condition", $._expression),
          ")",
          field("consequence", $._statement),
          optional(seq("sivyo", field("alternative", $._statement))),
        ),
      ),

    while_statement: ($) =>
      seq(
        "wakati",
        "(",
        field("condition", $._expression),
        ")",
        field("body", $._statement),
      ),

    for_statement: ($) =>
      seq(
        "kwa",
        "(",
        field("init", optional($._for_clause)),
        ";",
        field("condition", optional($._expression)),
        ";",
        field("update", optional($._expression)),
        ")",
        field("body", $._statement),
      ),

    _for_clause: ($) => choice($._expression, $._bare_local_declaration),

    // Tangazo la kigezo ndani ya kichwa cha kwa (bila ';' ya mwisho)
    _bare_local_declaration: ($) =>
      seq(
        field("type", $._type),
        field("name", $.identifier),
        optional(seq("=", field("value", $._expression))),
      ),

    do_while_statement: ($) =>
      seq(
        "fanya",
        field("body", $.block),
        "wakati",
        "(",
        field("condition", $._expression),
        ")",
        ";",
      ),

    switch_statement: ($) =>
      seq(
        "chagua",
        "(",
        field("value", $._expression),
        ")",
        "{",
        repeat($.switch_case),
        "}",
      ),

    switch_case: ($) =>
      choice(
        seq("hali", field("label", $._expression), ":", repeat($._statement)),
        seq("sivyo", ":", repeat($._statement)),
      ),

    return_statement: ($) =>
      seq("rudisha", optional(field("value", $._expression)), ";"),

    break_statement: (_) => seq("vunja", ";"),

    continue_statement: (_) => seq("endelea", ";"),

    local_variable_declaration: ($) =>
      prec.dynamic(
        1,
        seq(
          field("type", $._type),
          $.declarator,
          repeat(seq(",", $.declarator)),
          ";",
        ),
      ),

    declarator: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq("[", field("size", $._expression), "]")),
        optional(seq("=", field("value", $._expression))),
      ),

    expression_statement: ($) => seq($._expression, ";"),

    // -----------------------------------------------------------
    // Usemi -- utangulizi kutoka hati/vipimo-vya-lugha.md sehemu 4
    // (kina 12 juu kabisa hadi 1 chini kabisa, ugawi ni wa kulia,
    // vingine vyote ni vya kushoto):
    //   12: * / %   11: + -   10: << >>   9: < > <= >=   8: == !=
    //   7: &   6: ^   5: |   4: &&   3: ||   2: ?:   1: =
    // -----------------------------------------------------------
    _expression: ($) =>
      choice(
        $.assignment_expression,
        $.ternary_expression,
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.field_expression,
        $.subscript_expression,
        $.address_expression,
        $.dereference_expression,
        $.parenthesized_expression,
        $.identifier,
        $.number_literal,
        $.char_literal,
        $.string_literal,
      ),

    // MUHIMU: += -= *= /= %= &= |= ^= <<= >>= zote zinafanya kazi
    // HALISI kwenye stage1 (jaribio_mende_18_kiwanja_biti.swa, "0" =
    // inapita) -- hati/vipimo-vya-lugha.md 2.5 (orodha ya ishara)
    // IMEPITWA NA WAKATI, haitaji hizi, lakini chanzo halisi/jaribio
    // linathibitisha zinatumika kikamilifu.
    assignment_expression: ($) =>
      prec.right(
        1,
        seq(
          field("left", $._expression),
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
          field("right", $._expression),
        ),
      ),

    ternary_expression: ($) =>
      prec.right(
        2,
        seq(
          field("condition", $._expression),
          "?",
          field("consequence", $._expression),
          ":",
          field("alternative", $._expression),
        ),
      ),

    binary_expression: ($) => {
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
              field("left", $._expression),
              field("operator", operator),
              field("right", $._expression),
            ),
          ),
        ),
      );
    },

    unary_expression: ($) =>
      prec(
        13,
        seq(field("operator", choice("!", "~", "-")), field("operand", $._expression)),
      ),

    address_expression: ($) =>
      prec(13, seq("&", field("operand", $._expression))),

    dereference_expression: ($) =>
      prec(13, seq("*", field("operand", $._expression))),

    call_expression: ($) =>
      prec(
        14,
        seq(
          field("function", $._expression),
          field("arguments", $.argument_list),
        ),
      ),

    // MUHIMU: ukubwa(AINA) na urefu(kigezo) ni kazi za KAWAIDA (SI
    // maneno muhimu -- kuzifanya "keyword-like" literals kwenye
    // sarufi hii KULIVUNJA uchanganuzi wa msambazaji.swa halisi,
    // kwa sababu tree-sitter huchukua neno lolote la herufi
    // lililoandikwa moja kwa moja (bila token()) kama "keyword
    // extraction" yenye kipaumbele zaidi ya identifier -- na "urefu"
    // ni jina la kawaida la kigezo/paramu (maana yake ni "length")
    // linalotumika mahali pengi kama thamani ya kawaida, si kama
    // wito wa kazi hii. Badala yake, hoja ya kwanza ya wito WOWOTE
    // inaruhusiwa kuwa jina la aina la msingi moja kwa moja (mfano
    // "n32" kwenye ukubwa(n32)) -- hii ni uwezekano wa kisintaksia
    // tu, si ukaguzi wa kisemantiki wa jina la kazi (huo ni kazi ya
    // mkusanyaji, si ya sarufi hii ya highlighting).
    argument_list: ($) =>
      seq("(", commaSep(choice($._expression, $.primitive_type)), ")"),

    field_expression: ($) =>
      prec(
        14,
        seq(
          field("object", $._expression),
          field("operator", choice(".", "->")),
          field("field", $.identifier),
        ),
      ),

    subscript_expression: ($) =>
      prec(
        14,
        seq(
          field("object", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    // -----------------------------------------------------------
    // Vitambulisho, herufi/nambari, mfuatano, maoni
    // (hati/vipimo-vya-lugha.md 2.1: a-z, A-Z, _ mwanzoni; tarakimu
    // baadaye)
    // -----------------------------------------------------------
    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number_literal: (_) => /[0-9]+(\.[0-9]+)?/,

    // Halisi ya herufi moja -- inasomwa na msomaji.swa (tokeni_soma_herufi)
    // kama TOKENI_NAMBARI (thamani ya baiti yake, sio aina tofauti kama
    // C ya kweli). Utorokaji: \xNN (heksadesimali, tarakimu 1-2) au
    // herufi YOYOTE moja baada ya '\' (\n \t \r \\ \0 \' n.k. -- lexer
    // ni ya jumla, si orodha maalum ya utorokaji unaokubalika).
    char_literal: (_) =>
      token(
        seq(
          "'",
          choice(seq("\\", "x", /[0-9a-fA-F]{0,2}/), seq("\\", /./), /[^'\\]/),
          "'",
        ),
      ),

    // MUHIMU: mfuatano LAZIMA uwe token MOJA HALISI (token()), si
    // mnyororo wa tokeni ndogo -- vinginevyo lexer ya tree-sitter
    // ingejaribu kulinganisha herufi/maneno ndani ya mfuatano (mfano
    // "HITILAFU" ndani ya `andika_stderr("; DEB: HITILAFU ...")`)
    // dhidi ya sheria za identifier/neno-muhimu badala ya kuzisoma
    // kama sehemu ya mfuatano -- iligunduliwa kwa jaribio HALISI
    // dhidi ya msambazaji.swa halisi (mfuatano zenye maneno ya
    // Kiingereza kama HITILAFU/DEB ndani yake zilivunja uchanganuzi).
    // \% pia ni utorokaji halisi (hati/uthibitisho-wa-lugha.md 8.2,
    // jaribio_t94_asilimia_utorokaji.swa) -- si \n/\\/\t/\" tu.
    string_literal: (_) =>
      token(seq('"', repeat(choice(/\\[n\\t"%]/, /[^"\\\n]/)), '"')),

    comment: (_) =>
      token(
        choice(
          seq("//", /.*/),
          // Maoni ya /* */ yanaweza kupachikana (nested) kwenye
          // mnyororo wa uzalishaji (stage1) -- imethibitishwa na
          // jaribio_k11a_maoni_ya_kijiuzi.swa (KINA CHA 3: "/* a /* b
          // /* c */ */ d */"). Tree-sitter's `token()` haiwezi
          // kuwakilisha upachikaji wa KWELI usio na mpaka kwa regex --
          // hiyo ingehitaji external scanner (kazi ya baadaye halisi,
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
// (kazi ya "comment" kwenye rules). Nambari 4 imeandikwa moja kwa
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

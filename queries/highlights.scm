; Sarufi ya highlighting kwa lugha ya Swa -- majina ya makundi
; yanafuata kanuni za kawaida za tree-sitter (@keyword, @type, n.k.)
; zinazoeleweka na nvim-treesitter na wenzake bila mipangilio ya
; ziada.

; Maneno muhimu ya lugha (msingi/mkusanyaji/msomaji.swa -- ni_neno_muhimu)
"muundo" @keyword.type
"rudisha" @keyword.return
"kama" @keyword.conditional
"sivyo" @keyword.conditional
"wakati" @keyword.repeat
"kwa" @keyword.repeat
"fanya" @keyword.repeat
"acha" @keyword.control
"endelea" @keyword.control
"chagua" @keyword.conditional
"hali" @keyword.conditional
"husisha" @keyword.import
"nje" @keyword.import
"achilia" @keyword.operator

; Aina za msingi (n8/n16/.../d64/w0/n.k., herufi ndogo pekee)
(aina_ya_msingi) @type.builtin

; Miundo ya mtumiaji (PascalCase kwa mkataba, jina la muundo au
; matumizi yake kama aina). _aina/_aina_ya_msingi ni sarufi zilizofichwa
; (jina lenye "_" mbele) -- hazina nodi zake kwenye mti, hivyo
; tunalenga sehemu ya "aina"/"aina_ya_kurudi" moja kwa moja kwenye kila
; nodi inayoibeba.
(tangazo_la_muundo jina: (kitambulisho) @type)
(tangazo_la_ndani aina: (kitambulisho) @type)
(tangazo_la_ulimwengu aina: (kitambulisho) @type)
(tangazo_la_sehemu aina: (kitambulisho) @type)
(kigezo aina: (kitambulisho) @type)
(tangazo_la_kazi aina_ya_kurudi: (kitambulisho) @type)
(tangazo_la_mbele aina_ya_kurudi: (kitambulisho) @type)
(kazi_ya_nje aina_ya_kurudi: (kitambulisho) @type)
(data_ya_nje aina: (kitambulisho) @type)

; Majina ya kazi
(tangazo_la_kazi jina: (kitambulisho) @function)
(tangazo_la_mbele jina: (kitambulisho) @function)
(kazi_ya_nje jina: (kitambulisho) @function)
(wito kazi: (kitambulisho) @function.call)

; Majina ya vigezo/sehemu
(kigezo jina: (kitambulisho) @variable.parameter)
(tangazo_la_sehemu jina: (kitambulisho) @property)
(usemi_wa_sehemu sehemu: (kitambulisho) @property)
(jina_linalotangazwa jina: (kitambulisho) @variable)

; Halisi
(nambari) @number
; MUHIMU: mfuatano ni tokeni MOJA HALISI bila
; nodi ndogo za utorokaji -- angalia maelezo kwenye
; grammar.js kuhusu kwa nini (mgongano wa lexer na maneno ndani ya
; mfuatano ulisababisha hitilafu halisi bila hii).
(mfuatano) @string
(maoni) @comment

; Waendeshaji
[
  "+" "-" "*" "/" "%"
  "<<" ">>" "<" ">" "<=" ">=" "==" "!="
  "&&" "||" "&" "|" "^" "!" "~"
  "=" "+=" "-=" "*=" "/=" "%=" "&=" "|=" "^=" "<<=" ">>="
  "?" ":"
  "->" "."
] @operator

["(" ")" "{" "}" "[" "]"] @punctuation.bracket
[";" ","] @punctuation.delimiter
(hoja_za_ziada) @punctuation.special

; kazi za ndani zenye tabia maalum (ukubwa/urefu zinachukua jina la
; aina kama hoja, tenga/badili/achilia zinahusiana na kumbukumbu)
((wito kazi: (kitambulisho) @function.builtin)
  (#match? @function.builtin "^(ukubwa|urefu|tenga|badili|wito_wa_mfumo)$"))

(kitambulisho) @variable

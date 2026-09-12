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
"vunja" @keyword.control
"endelea" @keyword.control
"chagua" @keyword.conditional
"hali" @keyword.conditional
"husisha" @keyword.import
"achilia" @keyword.operator

; Aina za msingi (n8/n16/.../d64/w0/n.k., herufi kubwa au ndogo)
(primitive_type) @type.builtin

; Miundo ya mtumiaji (PascalCase kwa mkataba, jina la muundo au
; matumizi yake kama aina). _type/_base_type ni sarufi zilizofichwa
; (jina lenye "_" mbele) -- hazina nodi zake kwenye mti, hivyo
; tunalenga field ya "type"/"return_type" moja kwa moja kwenye kila
; mzazi anayeitumia.
(struct_declaration name: (identifier) @type)
(local_variable_declaration type: (identifier) @type)
(global_variable_declaration type: (identifier) @type)
(field_declaration type: (identifier) @type)
(parameter type: (identifier) @type)
(function_declaration return_type: (identifier) @type)
(function_prototype return_type: (identifier) @type)

; Majina ya kazi
(function_declaration name: (identifier) @function)
(function_prototype name: (identifier) @function)
(call_expression function: (identifier) @function.call)

; Majina ya paramu/sehemu/vigezo
(parameter name: (identifier) @variable.parameter)
(field_declaration name: (identifier) @property)
(field_expression field: (identifier) @property)
(declarator name: (identifier) @variable)

; Halisi (literals)
(number_literal) @number
(char_literal) @character
; MUHIMU: mfuatano (string_literal) ni token MOJA HALISI bila
; sub-nodes za utorokaji (escape) -- angalia maelezo kwenye
; grammar.js kuhusu kwa nini (mgongano wa lexer na maneno ndani ya
; mfuatano ulisababisha hitilafu halisi bila hii).
(string_literal) @string
(comment) @comment

; Ishara/viendeshi
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

; kazi za ndani zenye tabia maalum (ukubwa/urefu zinachukua jina la
; aina kama hoja, tenga/badili/achilia zinahusiana na kumbukumbu)
((call_expression function: (identifier) @function.builtin)
  (#match? @function.builtin "^(ukubwa|urefu|tenga|badili|wito_wa_mfumo)$"))

(identifier) @variable

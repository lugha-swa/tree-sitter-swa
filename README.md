# tree-sitter-swa

Sarufi ya [Tree-sitter](https://tree-sitter.github.io/) kwa lugha ya
Swa -- lugha ya programu ya Kiswahili pekee, iliyojiandika yenyewe
(self-hosted), inayopatikana kwenye
[lugha-swa/swa](https://github.com/lugha-swa/swa).

## Kwa nini

Swa haipo (bado) kwenye orodha ya lugha za
[GitHub Linguist](https://github.com/github-linguist/linguist) --
uongezaji rasmi unahitaji kiwango cha matumizi (repos 200+
zisizo za fork) ambazo Swa haijafikia bado, kwa sababu ni lugha
mpya. Hilo si tatizo la kiufundi -- ni la muda na jamii. Sarufi hii
haitatui hilo, lakini inatatua tatizo la VITENDO la kila siku: **syntax
highlighting halisi** wakati wa kuandika `.swa` kwenye Neovim (au
kihariri chochote kinachotumia tree-sitter), na ni msingi
unaoendana na mwelekeo wa Linguist mwenyewe (unapendelea sarufi za
tree-sitter kuliko TextMate kwa lugha mpya).

## Chanzo cha ukweli

Sarufi hii SI dhana -- kila kanuni imetolewa kwa kusoma chanzo halisi
cha mkusanyaji wa Swa (`lugha-swa/swa`), hasa:

- `hati/vipimo-vya-lugha.md` -- vipimo rasmi vya lugha.
- `msingi/mkusanyaji/msomaji.swa` -- lexer halisi (`ni_neno_muhimu`
  ina orodha KAMILI ya maneno muhimu -- ikiwemo `tenga`, ambayo hati
  inadai SI neno muhimu lakini lexer inaithibitisha KWELI ni).
- `msingi/mkusanyaji/msambazaji.swa` -- parser halisi (jinsi aina za
  msingi zinavyotambuliwa, mpangilio wa taarifa, n.k.).
- `hati/uthibitisho-wa-lugha.md` na faili za `majaribio/programu/*.swa`
  -- vipengele vilivyothibitishwa kufanya kazi (au KUKATALIWA kwa
  makusudi) kwa jaribio halisi, si kwa kudhania tu.

Imejaribiwa dhidi ya **faili 300+ za `.swa` halisi** kwenye
`lugha-swa/swa` (289/300, 96.3%, zinachanganuliwa bila hitilafu -- 11
zilizosalia zote ni majaribio ya KUKATALIWA KWA MAKUSUDI na mkusanyaji
mwenyewe, mfano `++`/`--`/nukuu-ya-kisayansi/halisi-za-radiksi ambazo
HAZIPO kwenye lugha, AU mfano MMOJA wa mgongano wa kileksia
uliojulikana -- angalia "Mipaka Inayojulikana" chini) na **faili
111/111 (100%) za mradi wa Dominion** (`Kandemark/dominion`,
mradi mkubwa zaidi wa Swa uliopo, ukitumia herufi ndogo za aina za
msingi).

## Kutumia

### Kujenga

```sh
npm install
npx tree-sitter generate
npx tree-sitter build      # tree-sitter-swa.so (lugha ya kimatendo)
npx tree-sitter test       # jaribio la corpus (test/corpus/*.txt)
```

### Neovim (nvim-treesitter)

Swa HAIKO kwenye orodha ya ndani ya nvim-treesitter (ni lugha mpya
sana). Sajili kama parser ya nje kwenye `init.lua`:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.swa = {
  install_info = {
    url = "https://github.com/lugha-swa/tree-sitter-swa",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "swa",
}

vim.filetype.add({ extension = { swa = "swa" } })
```

Kisha: `:TSInstall swa`. Faili la `queries/highlights.scm` la hazina
hii litatumika moja kwa moja.

## Mipaka Inayojulikana

Sarufi hii ni kwa ajili ya **syntax highlighting**, SI mkusanyaji
kamili -- baadhi ya mipaka ifuatayo imekubaliwa kwa makusudi kwa
sababu suluhisho kamili ni kazi kubwa zaidi isiyolingana na lengo
la toleo hili la kwanza:

1. **Mgongano wa "b1"**: `b1` ni herufi kubwa/ndogo halali kabisa ya
   aina ya msingi (familia B, upana 1 -- boolean), lakini pia jina la
   kawaida la kigezo kwenye msimbo halisi (`msingi/mkusanyaji/
   uzalishaji.swa` inatumia "b1"/"b2"/"b3" kama majina ya vigezo vya
   ndani vya baiti). Kwenye nafasi ya mwanzo wa taarifa (ambapo
   tangazo la aina na usemi wa kawaida vyote viwili vinawezekana),
   sarufi hii inapendelea kusoma "b1" kama JINA LA AINA -- sawa na
   jinsi tree-sitter-c inavyoshughulikia mgongano uleule wa
   "typedef name" bila `external scanner` yenye jedwali la majina.
   Suluhisho kamili linahitaji external scanner inayofuatilia majina
   ya miundo/aina KWA MUKTADHA -- kazi ya baadaye halisi, nje ya wigo
   wa toleo hili.
2. **Upachikaji wa maoni `/* */`**: unaungwa mkono hadi KINA CHA 4
   (regex haiwezi kuwakilisha upachikaji usio na mpaka moja kwa
   moja) -- kina zaidi ya hapo kitaonekana kama hitilafu ya
   uchanganuzi. Suluhisho kamili pia linahitaji external scanner.
3. **Vipengele visivyopo kwenye lugha kwa makusudi** (na kwa hiyo
   havisaidiwi hapa PIA, kwa makusudi, ili kuendana na tabia halisi
   ya mkusanyaji): `++`/`--`, halisi za radiksi (`0xFF`/`0b1010`),
   nukuu ya kisayansi (`1.5e2`), kianzilishi cha safu (`{1,2,3}`).
   Haya YOTE yamethibitishwa kukataliwa kwa sauti na mkusanyaji
   halisi (`majaribio/programu/jaribio_mende_*_kata.swa`) -- sarufi
   hii ikiyakataa pia inalingana na lugha halisi, si pengo.

## Muundo wa hazina

- `grammar.js` -- ufafanuzi wa sarufi (Tree-sitter DSL).
- `src/` -- parser iliyozalishwa (`tree-sitter generate`).
- `queries/highlights.scm` -- kanuni za highlighting.
- `test/corpus/` -- majaribio ya corpus (`tree-sitter test`).
- `bindings/` -- viungo vya Node.js na C (mkataba wa kawaida wa
  hazina za `tree-sitter-<lugha>`).

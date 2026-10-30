<div align="center">
  <p>
    <a href="https://github.com/lugha-swa/tree-sitter-swa">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/lugha-swa/.github/main/rasilimali/mabango/tree-sitter-swa-giza.png">
        <img width="100%" src="https://raw.githubusercontent.com/lugha-swa/.github/main/rasilimali/mabango/tree-sitter-swa-mwanga.png" alt="tree-sitter-swa — sarufi ya Tree-sitter kwa lugha ya Swa">
      </picture>
    </a>
  </p>

[Tovuti](https://lugha-swa.github.io) | [Swa](https://github.com/lugha-swa/swa) | [Tree-sitter](https://tree-sitter.github.io/) | [Jamii](https://lugha-swa.github.io/jamii.html)

<br>

<img src="https://img.shields.io/badge/tree--sitter-0.27-A34E14" alt="tree-sitter 0.27">
<a href="LICENSE"><img src="https://img.shields.io/badge/leseni-MIT-6B5E4A" alt="Leseni MIT"></a>
<img src="https://img.shields.io/badge/corpus-22%2F22-6B5E4A" alt="corpus 22/22">

</div>
<br>

**tree-sitter-swa** ni sarufi ya [Tree-sitter](https://tree-sitter.github.io/) kwa [Swa](https://github.com/lugha-swa/swa) — inaleta **rangi halisi za sintaksia** kwenye Neovim na kihariri chochote kinachotumia Tree-sitter.

Swa bado haipo kwenye [GitHub Linguist](https://github.com/github-linguist/linguist): uongezaji rasmi unahitaji hazina 200+ zisizo fork zinazotumia lugha. Hilo ni suala la muda na jamii, si la kiufundi. Sarufi hii inatatua tatizo la kila siku sasa hivi, na ndiyo msingi ambao Linguist yenyewe inapendelea kwa lugha mpya.

## Anza

<details open>
<summary><b>Jenga na jaribu</b></summary>
<br>

```sh
npm install
npx tree-sitter generate
npx tree-sitter build      # tree-sitter-swa.so
npx tree-sitter test       # corpus: test/corpus/*.txt
```

</details>

<details open>
<summary><b>Neovim (nvim-treesitter)</b></summary>
<br>

Swa haiko kwenye orodha ya ndani ya nvim-treesitter. Isajili kama parser ya nje kwenye `init.lua`:

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

Kisha `:TSInstall swa`. `queries/highlights.scm` hutumika moja kwa moja.

</details>

## Usahihi

Kila kanuni imetolewa kwa kusoma chanzo halisi cha mkusanyaji, si kwa kudhania: `hati/vipimo-vya-lugha.md`, lexer (`msomaji.swa` — `ni_neno_muhimu` ndiyo orodha kamili ya maneno muhimu), parser (`msambazaji.swa`), na majaribio ya `majaribio/programu/`.

| Kipimo (2026-10-30, tree-sitter 0.27) | Matokeo |
|---|---|
| Corpus (`tree-sitter test`) | 22 / 22 |
| Faili zote za `.swa` kwenye [lugha-swa/swa](https://github.com/lugha-swa/swa) | 486 / 498 (97.6%) |
| Faili zote za `.swa` za [Dominion](https://github.com/Kandemark/dominion), mradi mkubwa zaidi wa Swa | 111 / 111 |

Faili 12 za Swa zisizochanganuliwa ni: **9** majaribio ya kukataliwa kwa makusudi (`++`, `--`, radiksi, nukuu ya kisayansi, kianzilishi cha safu — mkusanyaji huyakataa pia), na **3** mifano ya mgongano wa `b1` ulioelezwa hapa chini (`b1`, `b8` kama majina ya vigezo).

## Mipaka inayojulikana

Sarufi hii ni ya **rangi za sintaksia**, si mkusanyaji kamili. Mipaka hii imekubaliwa kwa makusudi:

1. **Mgongano wa `b1`.** `b1` ni jina halali la aina (familia `b`, upana 1), lakini pia jina la kawaida la kigeu (`uzalishaji.swa` hutumia `b1`/`b2`/`b3`). Mwanzoni mwa taarifa, ambapo tangazo na usemi vyote vinawezekana, sarufi hii husoma `b1` kama jina la aina — sawa na jinsi tree-sitter-c inavyoshughulikia mgongano wa "typedef name". Suluhisho kamili linahitaji external scanner inayofuatilia majina kwa muktadha.
2. **Maoni `/* */` yaliyopachikwa** yanaungwa mkono hadi kina cha 4 (regex haiwezi kuwakilisha upachikaji usio na mpaka). Kina zaidi kinahitaji external scanner pia.
3. **Vipengele visivyopo kwenye lugha** — `++`/`--`, radiksi (`0xFF`), nukuu ya kisayansi (`1.5e2`), kianzilishi cha safu (`{1,2,3}`) — havisaidiwi hapa pia, kwa makusudi, ili sarufi ilingane na mkusanyaji halisi.

## Muundo wa hazina

| Njia | Maelezo |
|---|---|
| `grammar.js` | ufafanuzi wa sarufi (Tree-sitter DSL) |
| `src/` | parser iliyozalishwa (`tree-sitter generate`) |
| `queries/highlights.scm` | kanuni za rangi |
| `test/corpus/` | majaribio ya corpus |
| `bindings/` | viungo vya Node.js na C |

## Ikolojia

| Hazina | Maelezo |
|---|---|
| [lugha-swa/swa](https://github.com/lugha-swa/swa) | mkusanyaji na maktaba ya msingi |
| [lugha-swa/kawira](https://github.com/lugha-swa/kawira) | Swa kwenye ring 0 — kernel inayoanzisha, iliyoandikwa kwa Swa |
| [lugha-swa/uchapaji-swa](https://github.com/lugha-swa/uchapaji-swa) | msomaji wa TrueType na kijazaji cha glyph, bila FreeType |
| [lugha-swa/tree-sitter-swa](https://github.com/lugha-swa/tree-sitter-swa) | sarufi ya Tree-sitter — hazina hii |
| [lugha-swa.github.io](https://github.com/lugha-swa/lugha-swa.github.io) | tovuti na mwongozo wa lugha |

## Leseni

[MIT](LICENSE).

<br>
<div align="center">
  <a href="https://github.com/lugha-swa"><img src="https://raw.githubusercontent.com/lugha-swa/.github/main/rasilimali/nembo/nembo-64.png" width="28" alt="lugha-swa"></a>
  <br>
  <sub>lugha-swa · Afrika ya Mashariki</sub>
</div>

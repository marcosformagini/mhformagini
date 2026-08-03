# Estilo Visual — Site M. H. Formagini (Clássico sobre papel creme)

## Identidade

- Site pessoal de autor de **Fantasia Épica** e **Alta Fantasia**
- Universo literário: Erráwyn, Crônicas Méssias
- Linguagem: a estrutura e os efeitos do site clássico (nav pill, marquee ✦,
  losango do autor, painel da wiki, brasas/partículas, tilt 3D) sobre uma
  **folha de papel creme**, com o **carmesim** da capa nova como única cor
  de destaque. O dourado foi aposentado.

## Paleta

- **Papel (campo do site):** `--paper` #DED7CA · `--paper-2` #D5CDBE ·
  `--paper-3` #C7BEAC · vinheta quente no `.site-bg-overlay`
- **Nanquim (seções sólidas):** `--dark` #141312 — marquee, Autor
  (`--alt`), Wiki (`--dark`), rodapé · texto claro `--text` #F0EDE6 /
  `--text-2` #A6A6A6
- **Tinta sobre papel:** `--ink` #1A1410 · `--ink-2` #3D3830 · `--ink-3` #6D665E
- **Carmesim:** `--accent` #D9584B (sobre nanquim) · `--accent-light` #E8837A
  (hover no escuro) · `--accent-dark` #9E2B22 (texto/acento sobre papel) ·
  rgba(217,88,75,·) no escuro, rgba(158,43,34,·) no claro
  (nomes `--accent*` vêm do antigo `--gold*`)

## Ritmo das seções

Hero (papel) → marquee (nanquim) → **A Capa** (papel + pintura ao fundo) →
Lançamento (`--light`, claro) → Autor (**nanquim**) → Wiki (**nanquim**) →
FAQ (papel) → rodapé (nanquim).

`.section--paper` = seção direto sobre o creme (A Capa, FAQ): tinta escura,
acento `--accent-dark`, com bloco próprio de overrides no CSS.

## Hero

- Papel creme; título do livro em Pirate Scroll **vermelho chapado, parado**
  (sem shimmer — brilho sobre creme lê como glow).
- A arte da capa com céu recortado (`arte-recorte-1400/2200.webp`) nasce da
  borda de baixo (`.hero-scape`, grayscale, opacity .5, mask pra cima).
- Livro flutuante = **mockup aberto** (`sdg-mock-aberto`), com bookFloat,
  tilt 3D e sombra quente; selo escuro "Capa revelada" → #capa.
- Subtítulo em nanquim com ignição letra a letra; brasas do canvas em
  vinho + motas de nanquim (recoloridas pro papel).
- O vídeo do hero foi removido (assets/video fica no repo).

## Seção A Capa

- **A pintura de Tiago Sousa é o FUNDO da seção** (`.capa-bg`): cinza no
  repouso (opacity .42, mask desvanecendo pra baixo), **ganha cor quando o
  mouse entra na seção** (`#capa:hover` — crossfade 1.2s); no toque, a cor
  sangra por scrub de rolagem (`@media (hover:none)` + `animation-timeline`).
  Não existe mais figura separada da arte nem lightbox dela.
- Capa vertical com lightbox + chip "Concluída"; créditos **Arte** Tiago
  Sousa · **Capa** Bia Cunha; citação da quarta capa; nota explicando a
  pintura ao fundo.
- Galeria de 4 mockups em cartões de papel (`.section--paper .plate`).

## Andamento (tracker)

Capa concluída (link → #capa) · **Revisão 82%, "Quase concluída"**
(`--almost`) · Diagramação e prova pendentes · Pré-venda = meta.

## Efeitos (herdados do clássico)

Brasas no hero, partículas no Autor (escuro: rgba 217,88,75) e FAQ (claro:
vinho/nanquim fracos), tilt 3D, marquee infinito, ignição do subtítulo,
reveals por IntersectionObserver, parallax de saída do hero, reduced-motion
cobre tudo (incl. `.capa-bg-color` fica cinza).

## Referências

- Capa/mockups: `assets/img/capa/` · Mapas prontos não usados:
  `assets/img/maps/` (derivadas errawyn-1200/2000 cinza, messio-*)
- Fases anteriores nos commits: v6 papel&sangue 41caebc · v7 completo
  6b4e02d (A História/sinopse, mapa-prancha, movimento tokenizado) ·
  dark glass carmesim ee26fcb
- Zero dependências; a11y (aria, sr-only, reduced-motion)

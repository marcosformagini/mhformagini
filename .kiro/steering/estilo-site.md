# Estilo Visual — Site M. H. Formagini (Dark Glass Carmesim)

## Identidade

- Site pessoal de autor de **Fantasia Épica** e **Alta Fantasia**
- Universo literário: Erráwyn, Crônicas Méssias
- Linguagem: **dark glass fantasy** — fundo escuro com imagens desfocadas,
  painéis de vidro (backdrop-filter), cantos arredondados, brilhos sutis.
  A cor de destaque é o **carmesim** da capa nova (o dourado foi aposentado).

## Paleta

- Fundo: `--bg` #0D0D0D · vidro `--glass` rgba(13,13,13,.75) ·
  bordas `--glass-border` rgba(217,88,75,.14)
- Texto: `--text` #F0EDE6 · `--text-2` #A6A6A6 · `--text-muted` #6A6458
- **Acento carmesim** (nomes históricos vêm do dourado, valores são vermelhos):
  `--accent` #D9584B · `--accent-light` #E8837A (hover) ·
  `--accent-dark` #9E2B22 (sobre a seção clara) · `--crimson` #6E1A14 (massas)
- Seção clara (`.section--light`): tinta `--ink` #1A1410 / `--ink-2` #3D3830
- Glows e rgba de acento: rgba(217,88,75,·) no escuro, rgba(158,43,34,·) no claro

## Estrutura

Hero (vídeo→slideshow, livro flutuante = mockup da Edição Definitiva, selo
"Capa revelada" → #capa) → marquee ✦ → **A Capa** `#capa` (enxerto do redesign
carmesim) → Lançamento `#lancamento` (claro, tracker) → Autor `#autor`
(losango) → Wiki `#wiki` (painel giratório) → FAQ → rodapé.

Nav: Início · A Capa (ponto de novidade) · Lançamento · Autor · Wiki · FAQ.

## Seção A Capa

- Capa vertical com lightbox, chip "Concluída", créditos **Arte** Tiago Sousa ·
  **Capa** Bia Cunha, citação da quarta capa ("Os corvos não são os únicos
  com fome").
- A pintura em faixa cinza que **ganha cor no hover** (desktop) e por
  scroll-scrub no toque (`@media (hover:none)` + `@supports animation-timeline`).
- Galeria de 4 mockups em cartões de vidro; tudo abre no lightbox.
- Sub-blocos usam `.capa-subhead` (sec-label + sec-line).

## Efeitos (herdados do clássico — ficam)

- Brasas no hero, partículas no Autor e FAQ (canvas, pausa fora da viewport)
- Névoa com parallax do mouse; tilt 3D do livro; shimmer no título
- Fundo fixo alternado por seção (`.site-bg` / `bg-alt`); #capa usa o fundo padrão
- Marquee infinito; ignição letra a letra do subtítulo
- Reveals por IntersectionObserver; reduced-motion cobre tudo

## Referências de produção

- Mockups/capa: `assets/img/capa/` (sdg-capa, sdg-mock-*, arte-cinza/cor)
- Mapas prontos (não usados no site, material futuro): `assets/img/maps/`
  errawyn-1200/2000 (cinza), messio-760/1200/1800 — originais 2.2MB/12.5MB
  nunca vão à página sem derivada
- O redesign "Papel & Sangue" completo (v6/v7) vive nos commits 41caebc e
  6b4e02d — inclusive a seção A História (sinopse integral) e o mapa-prancha
- Zero dependências externas; acessibilidade (aria, reduced-motion, sr-only)

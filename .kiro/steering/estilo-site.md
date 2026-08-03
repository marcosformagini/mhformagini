# Estilo Visual — Site M. H. Formagini (v7)

## Identidade

- Site pessoal de autor de **Fantasia Épica** e **Alta Fantasia**
- Universo literário: Erráwyn, Crônicas Méssias
- Linguagem: **cartaz impresso**. Campo de papel envelhecido, imagem em
  escala de cinza, e UM vermelho óxido como única cor da página.

## Paleta

Preto, branco, escalas de cinza — e o vermelho que destaca.

- **Papel:** `--paper` #DED7CA · `--paper-2` #D5CDBE · `--paper-3` #C7BEAC (fios, bordas)
- **Nanquim:** `--ink` #141312 · `--ink-2` #3A3531 (corpo) · `--ink-3` #6D665E ·
  `--ink-4` #9A9187 · `--ink-line` #2E2A27 (fios sobre nanquim) ·
  `--ink-body` #C3BCB1 (corpo sobre nanquim)
- **A única cor:** `--red` #9E2B22 (sobre papel) · `--red-lift` #D9584B (sobre nanquim) ·
  `--red-deep` #6E1A14 (massas sólidas)

Regras:
- Nada de segunda cor. Se algo precisa de destaque, é vermelho ou é nanquim.
- Contraste: `--red` só como texto sobre papel; sobre nanquim usar `--red-lift`.
- Toda foto leva `filter: grayscale(1)`. **Exceções:** a capa do livro e os
  mockups (já são cinza com estandartes escarlates — a origem da paleta).
  O mapa de Erráwyn é servido em derivada já cinza (pré-processada) e entra
  com `mix-blend-mode: multiply` — impresso no papel, não colado.

## Espinha narrativa (ordem das seções)

O site conta UMA história: "uma saga épica está ganhando sua edição definitiva".

Hero `#home` (papel, a promessa) → **A História** `#historia` (**nanquim**, a
sinopse da quarta capa) → A Capa `#capa` (papel, o objeto) → A Edição
`#lancamento` (papel-2, diário de produção) → Erráwyn `#errawyn` (papel, o
mundo/mapa) → O Autor `#autor` (**nanquim**) → FAQ `#faq` (papel-2) →
rodapé (nanquim).

Nav: História · A Capa · Edição · Erráwyn · Autor · FAQ (brand → #home).
`id="lancamento"` fica — âncoras já compartilhadas não quebram.

## Formas

- **O arco** (`.arch`): retângulo de topo semicircular, vermelho chapado.
  Forma-assinatura, sempre atrás do assunto: livro (hero), capa, retrato.
  Cresce do chão (`scaleY`) quando o PAI entra na tela.
  No `arch--capa`, o degrau do recorte é em **pixels** (ancorado na altura da
  imagem da capa) — porcentagem escorrega quando a seção cresce e o vermelho
  invade as legendas. No mobile, arco nunca atrás de texto (vermelho sobre
  vermelho apaga título).
- **Marcas de registro** (`.tick`): cruzetas de 1px — cantos do hero e da
  prancha do mapa.
- **Fios pendurados** (`.drips`): cotas ancoradas na base das seções,
  comprimentos e tons desiguais. `<defs>` + `<use>`. Sobre nanquim viram creme.
  O hero não leva fios (a muralha já ocupa a base).
- **Grão + envelhecimento** (`.grain`): ruído em dois ladrilhos primos
  (512/662px) + manchas e vinheta. Sem `mix-blend-mode` na camada fixa.
- **Muralha sangrando** (`.hero-scape`): a pintura com céu recortado nasce da
  borda de baixo do hero (opacity .5) e se dissolve por `mask-image`.
- **Prancha de arquivo** (`.map-plate`): mapa com moldura dupla
  (border + outline offset), cruzetas nos cantos, legenda-colofão. Lightbox em
  cinza — a cor é exclusividade da capa e da pintura.
- Sem cantos arredondados, sem vidro fosco, sem sombras coloridas.

## Tipografia

- **Título do livro** (`.hero-title`): Pirate Scroll, vermelho, empilhado,
  entrelinha 0.86. **Só** para "Sombras da Guerra". Estático — nada de
  background-clip animado (os glifos PT-BR compostos podem vazar do clip).
- **Display de seção** (`.sec-title`): Cinzel caixa alta, TRÊS degraus:
  gigante empilhado (SÓ A História e A Capa), `--m` (Erráwyn, Autor),
  `--s` linha única (Edição, FAQ). `<em>` = nanquim; o bicolor é a assinatura.
- **Sub-cabeçalho de bloco** (`.sub-head`): Cinzel 0.82rem nanquim + fio.
  Dois níveis de hierarquia interna, nunca o mesmo dispositivo do sec-head.
- **Corpo:** Libre Baskerville, `--ink-2` (papel) / `--ink-body` (nanquim).
- **Rótulos:** dois tokens só — `--fs-label` 0.68rem/3px, `--fs-label-s`
  0.6rem/2.5px.
- **Único display fora de sec-title:** a linha dos corvos em A História
  (Cinzel, `--red-lift`, teto 2.6rem). Por ser único, pesa.
- Citações: `.pull` (filete vermelho) e modificador `.pull--lg` — máx. 1 por seção.

## Sistema de movimento (contrato)

- **Uma curva:** `--ease: cubic-bezier(0.22,1,0.36,1)`. Scroll-driven é
  sempre `linear` (scrub).
- **Cinco durações:** 180 (hover in) / 320 (nav, lightbox, hover out) /
  640 (reveals) / 960 (wipes, barras, fios de cabeçalho) / 1400 (arco, fios).
  Nada fora da escala — "500ms só dessa vez" não existe.
- `--stagger: 90ms` com teto de 4 passos (`min(var(--n),3)`); `--rise: 18px`.
- **Zero animações infinitas.** O indicador de scroll pulsa 3 ciclos e para;
  JS o esconde no primeiro scroll.
- **Entrada de página** (só o hero): arco + muralha → eyebrow → título linha
  a linha → subtítulo "tinta secando" (40ms/letra, determinístico, esquerda→
  direita, um class flip) → livro → selo carimba (overshoot 1.18) → indicador.
  Delays explícitos por `--dl` inline.
- **Entrada por scroll:** `.reveal` por BLOCO compositivo (máx. ~3 por
  viewport); `.reveal-list` observa a LISTA, filhos escalonam por `--n`;
  `.reveal--wipe` para imagem grande (no `.zoom` interno — legendas e selos
  fora do clip). Entrada via animation `backwards` (não transition) para não
  atrasar hovers.
- **Scroll-driven (4 usos):** barra de progresso, deriva da muralha
  (translateY, SEM scale), saída do hero, respiração da pintura — mais a
  sangria de cor da pintura no toque (`@media (hover:none)` + `@supports`).
- **Deriva do livro:** lerp em rAF (fator 0.08, 10px máx.), sem transition.
- **Barras do tracker:** `transform: scaleX(var(--w-n))` (fração, zero
  reflow), cascata com teto.

### Lei do observer (armadilha promovida a lei)

O `IntersectionObserver` leva `clip-path` e `transform` em conta. **Todo
elemento que nasce recortado ou achatado (fios, arcos, wipes) registra o PAI
no observer** — o próprio nunca "entra" na tela.

### Reduced-motion é o espelho do inventário

Nenhum efeito entra no CSS sem sua linha de estado final no bloco
`prefers-reduced-motion`. O kill global de 0.01ms existe, mas não substitui a
declaração explícita.

## Créditos

Linha visível na legenda da capa: **Arte — Tiago Sousa · Capa — Bia Cunha**
(uma vez só; crédito visível é linguagem de obra impressa).

## Princípios

- Elegância pela restrição, não pelo acúmulo
- Sem canvas, sem partículas, sem vídeo de fundo, sem brilho/glow
- Quando tudo anima, nada impressiona: cortar antes de adicionar
- Espaçamento generoso, alinhamento à esquerda, ragged right
- Mobile-first responsivo, acessibilidade (aria, contraste, reduced-motion)
- Zero dependências externas
- Assets pesados nunca vão à página sem derivada (`errawyn.webp` 2.2MB e
  `mapa.webp` 12.5MB são fonte, não deploy)

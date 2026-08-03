# Redesign v7 — "Papel & Sangue" maduro

Data: 2026-08-03 · Origem: pedido do autor ("mais organizado, mais impressionante,
mais épico, sem perder a seriedade; sem brilhos; profissionalismo, beleza e
delicadeza na medida certa") + painel de 3 lentes (organização, movimento,
arte épica) com crítica adversária.

## Decisão central

A identidade v6 (papel envelhecido, grão, UM vermelho óxido, Pirate Scroll /
Cinzel / Libre Baskerville, o arco) **fica**. Muda a execução: espinha
narrativa nova, sistema fechado de movimento, cortes de ruído, dois momentos
épicos novos ancorados em material real do livro (sinopse da quarta capa e
mapa de Erráwyn).

## Espinha narrativa (nova ordem)

| # | Seção | Fundo | Conteúdo |
|---|-------|-------|----------|
| 1 | `#home` Hero | papel | A promessa: título, livro, 2 CTAs |
| 2 | `#historia` A História (NOVA) | nanquim | Sinopse integral da quarta capa; clímax "Os corvos não são os únicos com fome" |
| 3 | `#capa` A Capa | papel | O objeto: revelação, arte de Tiago Sousa, edição por inteiro |
| 4 | `#lancamento` A Edição | papel-2 | Diário de produção: notes + tracker protagonista |
| 5 | `#errawyn` Erráwyn | papel | O mundo: mapa como prancha de arquivo + porta para a wiki |
| 6 | `#autor` O Autor | nanquim | Retrato no arco, citação |
| 7 | `#faq` FAQ | papel-2 | 6 itens (perecível removido) |
| 8 | footer | nanquim | — |

Nav: História · A Capa · Edição · Erráwyn · Autor · FAQ (brand → #home).
Marquee morre; A História herda a batida de nanquim pós-hero.

## Hero enxuto (11 → 7 elementos)

Fica: eyebrow "Crônicas Méssias · Volume I", h1, sub "Sangue do Império",
assinatura, 2 CTAs ("Ler a história" → #historia sólido; "Ver a capa" → #capa
contorno), livro + selo (selo vira `<a href="#capa">`), indicador de scroll,
paisagem da muralha (opacity 0.36 → ~0.5, máscara recalibrada), arco, cruzetas.
Sai: flash pill, hero-desc, 3º CTA, canvas de poeira, fios do hero.

Cena dirigida (única animação de entrada da página): arco cresce (1400ms) +
paisagem surge (1200ms) → eyebrow → título linha a linha (640ms, +90ms cada) →
subtítulo "tinta secando" determinístico esquerda→direita (40ms/letra, um class
flip, zero timers) → assinatura → ações → livro (960ms) → selo carimba
(overshoot domado 1.18) → indicador (3 pulsos finitos, some no 1º scroll).
Título estático depois: inkSweep infinito morre; sem demão animada
(background-clip sobre a Pirate Scroll remendada é risco nos acentos).

## Sistema de movimento (tokens em :root)

- `--ease: cubic-bezier(0.22,1,0.36,1)` — curva única; scrub scroll é linear.
- Durações: `--t-touch:180ms` (hover in), `--t-move:320ms` (nav/lightbox/hover out),
  `--t-read:640ms` (reveals), `--t-press:960ms` (wipes/barras/sec-rule),
  `--t-draw:1400ms` (arco, fios — teto).
- `--stagger: 90ms`, teto 4 passos (`min(var(--n),3)`); `--rise: 18px` única.
- **Zero animações infinitas no site.** Morrem: inkSweep, flashPulse, freshPop,
  scrollPulse perpétuo, marquee, poeira, ignição aleatória, deriva elástica.
- Scroll-driven (4 usos): barra de progresso, deriva da paisagem (translateY -10%,
  SEM scale), saída do hero (opacity .3), respiração da pintura (plateDrift 1.06)
  + sangria de cor da pintura no mobile (`@media (hover:none)` + `@supports`).
- Reveal por bloco compositivo (máx. ~3/viewport); listas observam a LISTA.
- Deriva do livro: lerp em rAF (fator 0.08, MAX 10px), sem transition, ativa
  após a entrada.
- Barras do tracker: `transform: scaleX(var(--w-n))` (fração), cascata com teto.
- Lei do observer (comentário no CSS e no JS): quem nasce com clip-path ou
  transform registra o PAI no IntersectionObserver.
- Reduced-motion: bloco espelho — nenhum efeito entra sem sua linha.

## Tipografia

- 3 degraus de sec-title: 1 (empilhado gigante — só História e A Capa),
  2 (`--m`, clamp ~1.9–3.2rem — Erráwyn e Autor), 3 (`--s`, linha única —
  Edição e FAQ). Bicolor vermelho/nanquim vale nos três. Eyebrow idêntico em
  todas — fio condutor.
- Rótulos consolidados em 2 tokens: `--fs-label: 0.68rem/3px` e
  `--fs-label-s: 0.6rem/2.5px`.
- Citação grande = modificador `.pull--lg` (máx. 1 por seção). Sem componente novo.
- Único display fora de sec-title: a linha dos corvos (Cinzel caps, `--red-lift`,
  teto ~2.6rem, reveal padrão — sem palavra-a-palavra).

## A História (nova)

Lede em Baskerville itálico claro ("A lenda prometia…"), corpo da sinopse
integral (4 parágrafos — sem "ler mais"), divisor traço–losango–traço
(ornamento real impresso na quarta capa), clímax dos corvos, ponte
"Ver a edição" → #capa. Sem imagem de fundo: o impacto é tipográfico.
A pull-quote dos corvos SAI de A Capa (a linha existe uma vez no site).

## A Capa

3 blocos com `.sub-head` em nanquim: A revelação / A arte de Tiago Sousa /
A edição por inteiro. Tally e credit-inline saem. Créditos viram linha visível
"ARTE — TIAGO SOUSA · CAPA — BIA CUNHA" sob a capa. Arco íntegro (sem polígono
com degrau), terminando atrás da legenda. Plate da quarta capa linka #historia.
Legenda da pintura cita mouse E rolagem (mobile ganha a sangria por scrub).

## Erráwyn

Mapa continental como prancha de arquivo: derivadas pré-processadas em cinza
com contraste ajustado (`errawyn-1200/2000.webp` — geradas; original 2.2MB
nunca é servido). Moldura dupla (border + outline offset), cruzetas nos cantos,
legenda-colofão "Arquivo da Ordem de Monte Carvalho". Lightbox em cinza —
a cor é exclusividade da capa e da pintura. Depois: 1 parágrafo (Ordem absorve
a nota "A Ordem"), chips (única lista), selo + citação, CTA "Explorar a Wiki".
Saem: screenshot wiki-shot, nota "O Acervo".

## Limpezas

- FAQ "A capa nova já está pronta?" fundido na 1ª resposta.
- Redundâncias: "3 de 6" só no tracker; Tiago Sousa uma vez; "100% independente"
  só em A Edição.
- JSON-LD ganha `Book` (sinopse agora é indexável).
- estilo-site.md atualizado: ritmo novo, tokens de movimento, lei do observer,
  fim da contradição da poeira.

## Validação

Ondas com verificação visual no browser entre elas; teste de legibilidade dos
topônimos do mapa (feito — cinza pré-processado legível); painel de revisão
adversário (a11y, perf, responsivo, disciplina de movimento) antes do commit final.

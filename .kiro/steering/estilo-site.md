# Estilo Visual — Site M. H. Formagini

## Identidade

- Site pessoal de autor de **Fantasia Épica** e **Alta Fantasia**
- Universo literário: Erráwyn, Crônicas Méssias
- Linguagem: **cartaz impresso**. Campo de papel envelhecido, imagem em
  escala de cinza, e UM vermelho óxido como única cor da página.

## Paleta

Preto, branco, escalas de cinza — e o vermelho que destaca.

- **Papel:** `--paper` #DED7CA · `--paper-2` #D5CDBE · `--paper-3` #C7BEAC (fios, bordas)
- **Nanquim:** `--ink` #141312 · `--ink-2` #3A3531 (corpo) · `--ink-3` #6D665E · `--ink-4` #9A9187
- **A única cor:** `--red` #9E2B22 (sobre papel) · `--red-lift` #D9584B (sobre nanquim) ·
  `--red-deep` #6E1A14 (massas sólidas)

Regras:
- Nada de segunda cor. Se algo precisa de destaque, é vermelho ou é nanquim.
- Contraste: `--red` só como texto sobre papel; sobre nanquim usar `--red-lift`.
- Toda foto leva `filter: grayscale(1)`. **Única exceção:** a capa do livro e
  os mockups — já são cinza com estandartes escarlates, são a origem da paleta.

## Formas

- **O arco** (`.arch`): retângulo de topo semicircular, vermelho chapado.
  Forma-assinatura, sempre atrás do assunto: capa, retrato do autor, hero.
- **Marcas de registro** (`.tick`): cruzetas de 1px nos cantos, como prova de gráfica.
- **Fios pendurados** (`.drips`): cotas de desenho técnico ancoradas na **parte
  de baixo** das seções. Comprimentos e tons desiguais, agrupamento sem ritmo —
  é a variação que impede virar trama. Definidos uma vez em `<defs>`
  (`#drips-a` denso, `#drips-b` esparso) e reaproveitados com `<use>`; cada
  faixa de opacidade é um `<path>` só. Sobre nanquim viram creme.
- **Grão + envelhecimento** (`.grain` e `.grain::before`): ruído fixo em dois
  ladrilhos de tamanhos primos entre si (512/662px, sem emenda visível), mais
  manchas de umidade e vinheta quente. Sem `mix-blend-mode` — camada fixa que
  mistura faz o Chrome compor faixas em branco ao rolar.
- **Arte sangrando** (`.hero-scape`): a pintura com o céu recortado nasce da
  borda de baixo do hero e se dissolve pra cima por `mask-image`.
- Sem cantos arredondados, sem vidro fosco, sem sombras coloridas.

## Tipografia

- **Título do livro** (`.hero-title`): Pirate Scroll, vermelho, empilhado, entrelinha 0.86.
  É a letra da capa — usar **só** para "Sombras da Guerra".
- **Display de seção** (`.sec-title`): Cinzel, caixa alta, vermelho, empilhado
  em `<span>` por linha, entrelinha 0.92. `<em>` dentro do título vira nanquim
  (o bicolor vermelho/preto é a assinatura).
- **Corpo:** Libre Baskerville, `--ink-2`, medida ~62ch.
- **Meta / rótulos / botões:** Cinzel caixa alta, 0.6–0.7rem, letter-spacing 2.5–4px.

## Ritmo das seções

Papel domina; o nanquim entra como inversão deliberada.

Hero (papel) → marquee (nanquim) → A Capa (papel) → Lançamento (papel-2) →
Autor (**nanquim**) → Wiki (papel) → FAQ (papel-2) → rodapé (**nanquim**)

## Créditos

Visíveis na seção A Capa: **Arte** Tiago Sousa · **Capa** Bia Cunha

## Efeitos

O cartaz precisa respirar. Nada de decoração gratuita — todo efeito vem de
uma metáfora de impressão ou de desenho técnico.

- **O arco cresce** do rodapé da seção ao entrar na tela (`scaleY`), e **desce
  até a seção acabar**. Onde ele cruzaria texto, estreita numa perna via
  `clip-path` — vermelho chapado atrás de corpo de texto é ilegível.
- **Os fios se desenham** de cima para baixo (`clip-path` na faixa).
- **Imagens grandes** são reveladas por limpeza de baixo para cima
  (`.reveal--wipe`), como folha saindo da prensa — não sobem nem esmaecem.
- **A pintura sangra cor** no hover: a versão colorida mora sob a cinza e é
  revelada da esquerda para a direita. É o argumento da paleta, encenado.
- **Varredura de tinta** atravessando o título do livro, devagar.
- **Poeira de papel** suspensa no hero (canvas, pausa fora da tela).
- **Parallax de rolagem** por `animation-timeline: view()` — progressivo.
- **Selos** entram carimbando e ficam levemente tortos.
- Botões preenchem de baixo para cima; capa levanta do papel no hover.

**Armadilha recorrente:** o `IntersectionObserver` leva `clip-path` e
`transform` em conta. Elemento que começa recortado ou achatado nunca "entra"
na tela sozinho — observe sempre o **container**, nunca o próprio enfeite.

## Princípios

- Elegância pela restrição, não pelo acúmulo
- Animação sutil: reveal no scroll, deriva do livro com o mouse, nada além disso
- Sem canvas, sem partículas, sem vídeo de fundo
- Espaçamento generoso, alinhamento à esquerda, ragged right
- Mobile-first responsivo, acessibilidade (aria-labels, contraste adequado)
- Zero dependências externas

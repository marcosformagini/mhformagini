# Estilo Visual — Site M. H. Formagini

## Identidade

- Site pessoal de autor de **Fantasia Épica** e **Alta Fantasia**
- Tom: clássico, moderno e elegante
- Universo literário: Erráwyn, Crônicas Méssias

## Paleta de Cores

- **Fundo profundo:** #0A0A0F (bg-deep), #12121A (bg-surface), #1A1A25 (bg-elevated)
- **Dourado:** #C9A84C (principal), #E8D48B (claro), #8B6914 (escuro)
- **Prata:** #C0C0C0 (principal), #E0E0E0 (claro), #808080 (escuro)
- **Texto:** #F0EDE6 (primário), #9B978F (secundário), #6B6860 (muted)
- Contraste forte: dourado e prata sobre preto

## Tipografia

- **Títulos (h1–h6):** Cinzel — serifada clássica, capitalize
- **Títulos de destaque (hero, brand, announcement):** Cinzel Decorative — ornamental
- **Corpo de texto:** Libre Caslon Text (serifada, encorpada, legível, peso 400; itálico quando necessário)
- **Navbar brand:** Cinzel Decorative
- **Nav links, botões, badges, tags:** Libre Caslon Text
- Usar itálico para subtítulos, citações e textos de destaque emocional
- Letter-spacing generoso em elementos uppercase

## Animações

- Partículas douradas flutuantes (canvas) — efeito de fantasia
- Scroll reveal com timing escalonado (cubic-bezier)
- Hover suave em cards (translateY + box-shadow + glow)
- Ornamentos com gradiente linear (transparent → gold → transparent)
- Hero com reveal sequencial (keyframes revealUp com delays)
- Indicador de scroll com animação float

## Componentes

- **Navbar:** backdrop-filter blur, borda sutil dourada, links uppercase com underline animado
- **Cards:** fundo elevated, borda dourada sutil, hover com elevação e brilho top-line
- **Botões:** estilo outlined com borda dourada, hover fill com glow
- **Ornamentos:** linhas gradiente com diamante central (◆)
- **Seções:** separadas por linhas gradiente douradas

## Estrutura

- Single-page HTML (simplicidade)
- Bootstrap 5 para grid e responsividade
- CSS custom properties (variáveis)
- JavaScript vanilla para animações
- Sem frameworks JS pesados

## Princípios

- Elegância sobre complexidade
- Animações sutis, nunca exageradas
- Espaçamento generoso (padding 7rem nas seções)
- Mobile-first responsivo
- Acessibilidade (aria-labels, contraste adequado)

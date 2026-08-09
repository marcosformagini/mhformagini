# Vender *Sombras da Guerra* — Nuvemshop (físico) + Amazon KDP (ebook)

Estado atual: a estrutura de venda já está montada no site, **desligada**.
Nada aparece enquanto o `index.html` estiver com `data-loja="off"`.

Este documento é a lista do que fazer fora do código, na ordem.

---

## Divisão de papéis

| O quê | Onde | Por quê |
|---|---|---|
| Livro impresso, em 3 pacotes | Nuvemshop | Margem cheia, cliente é seu, frete integrado |
| Ebook | Amazon KDP | A busca da Amazon traz leitor que nunca ouviu falar de você |

A Nuvemshop **não traz tráfego** — ela converte quem você levou até lá (Instagram, TikTok, este site). A Amazon traz.

---

## Parte 1 — Antes de mexer na Nuvemshop

1. **CNPJ.** Dá para vender como pessoa física, mas sem CNPJ você não emite nota e alguns meios de pagamento limitam o volume. MEI resolve na maioria dos casos. **Confirme com um contador** — a atividade de venda de livro próprio tem particularidades.
2. **Imunidade tributária do livro.** Livro impresso tem imunidade constitucional de impostos (art. 150, VI, "d"). Não elimina a obrigação de emitir nota nem os tributos sobre lucro. De novo: contador.
3. **ISBN** do impresso, pela Câmara Brasileira do Livro. Precisa estar pronto antes de cadastrar o produto — e antes da gráfica.
4. **Custo real por exemplar.** Some: impressão + brindes (mapa, marcador, pôster, caixa) + embalagem + fita + etiqueta. É a base do preço dos três pacotes.
5. **Tiragem e onde guardar.** Você vai empacotar e postar. Cheque quanto de estoque cabe fisicamente.
6. **Peso e dimensões da caixa fechada**, por pacote. Sem isso o frete calcula errado e o prejuízo é seu.
7. **Conta bancária** para receber os repasses.

---

## Parte 2 — Nuvemshop, passo a passo

### 2.1 Criar a loja
1. `nuvemshop.com.br` → criar conta com o email do projeto.
2. Escolher o **Plano Começo** (R$ 0/mês, produtos ilimitados).
3. Preencher dados da loja: nome, CNPJ, endereço de origem das entregas, contato.

**Limitação importante do plano grátis:** ele **não** aceita domínio próprio. A loja fica num endereço `*.lojavirtualnuvem.com.br`. Para usar `loja.mhformagini.com.br` é preciso subir para o **Essencial (R$ 69/mês)**. Comece no grátis, suba quando as vendas justificarem — o site linka a URL que existir.

### 2.2 Meios de pagamento
1. Ativar o **Nuvem Pago**. Ele zera a tarifa por venda da plataforma nos planos Começo, Essencial, Impulso e Escala — sem ele, o Começo cobra tarifa por venda.
2. Taxas do Nuvem Pago em si (não são da plataforma, são do processamento):
   - **Pix — 0,99%**, cai na hora. É onde está quase metade do e-commerce brasileiro. Dê desconto no Pix.
   - **Cartão** — MDR variável conforme prazo de recebimento (2, 14 ou 30 dias) e número de parcelas, **+ R$ 0,35 fixo** por venda. Prazo maior = taxa menor.
   - **Boleto** — R$ 2,39 por transação, recebimento em até 2 dias.
   - Saque para conta: grátis no Bradesco, R$ 0,99 nos demais.
3. Definir o parcelamento (até 12x) e decidir quem paga os juros. Parcelamento sem juros sai do seu bolso.

### 2.3 Frete
1. Ativar **Correios** e/ou **Melhor Envio** (costuma sair mais barato).
2. Cadastrar peso e dimensões **de cada pacote** — não do livro nu.
3. Decidir a política de frete grátis. Se for usar, embuta o custo no preço.

### 2.4 Cadastrar os três pacotes
Cadastre como **três produtos separados**, não como variações do mesmo produto.
Motivo: o site linka direto para cada pacote, e variação não tem URL própria.

Para cada um:
- Nome exatamente igual ao do site: `Volume Avulso`, `Kit do Cartógrafo`, `Edição do Escriba`.
- Descrição: o que vem na caixa, item por item.
- Fotos: o livro real e os brindes reais. Foto de mockup vende menos que foto do objeto na mão.
- Preço, peso, dimensões, estoque.
- **Edição do Escriba:** estoque limitado de verdade. Se disser "limitada", limite.

### 2.5 Pegar as URLs
Abra cada produto na loja publicada e copie a URL da barra de endereço.
São essas três que entram no site.

### 2.6 Testar antes de anunciar
1. Faça **um pedido real seu**, com Pix, valor cheio.
2. Confira: email de confirmação chegou, pedido apareceu no painel, etiqueta de envio gerou, dinheiro caiu.
3. Cancele/estorne.
Loja que quebra na primeira venda real não ganha segunda chance.

---

## Parte 3 — Ligar a venda no site

Na ordem:

1. Abrir `index.html` e procurar por `TROCAR:`. Cada ocorrência é um dado pendente:
   - preço dos três pacotes;
   - `href` dos três botões `Comprar` → URL do produto na Nuvemshop;
   - `href` do botão `Ver na Amazon` → página do livro;
   - prazo de expedição em dias úteis.
2. Conferir se a lista de itens de cada pacote bate com o que está cadastrado na loja.
3. Trocar a chave geral, no topo do arquivo:
   ```html
   <html lang="pt-BR" class="no-js" data-loja="on">
   ```
4. Abrir o site e conferir: a seção **Comprar** aparece entre *Lançamento* e *Leituras*, o item entra no menu e no rodapé, e a numeração do trilho renumera sozinha (Comprar vira 003, Leituras 004, e assim por diante).
5. Commit e deploy.

Para desligar tudo de novo — falta de estoque, pausa, problema com a gráfica — basta voltar para `data-loja="off"`. Um caractere.

---

## Parte 4 — Ebook na Amazon KDP

1. Conta em `kdp.amazon.com` com os dados fiscais preenchidos (tem formulário de imposto para não residente nos EUA — sem isso a Amazon retém 30%).
2. Subir o arquivo. Aceita `.docx` e `.epub`; **epub** dá muito menos dor de cabeça na formatação.
3. Capa: a Amazon exige proporção própria, sem a lombada e a quarta capa do impresso. Peça o recorte ao Tiago Sousa.
4. **Preço e royalty:** 70% só vale dentro de uma faixa de preço definida pela Amazon; fora dela, cai para 35%. Cheque a faixa vigente antes de precificar.
5. **KDP Select:** exige exclusividade do *ebook* na Amazon por 90 dias, renováveis. Como o ebook só vai existir lá mesmo, vale — entra no Kindle Unlimited e rende por página lida. **Não afeta o impresso**, que continua na sua loja.
6. Publicado, copiar a URL do livro e colar no botão `Ver na Amazon`.

---

## Parte 5 — Depois da primeira venda

- **Nota fiscal** de cada pedido. Existem integrações da Nuvemshop que emitem sozinhas.
- **Embalagem.** O livro precisa chegar inteiro. Plástico bolha e caixa rígida, não envelope.
- **Prazo prometido é dívida.** Prefira prometer folgado e entregar antes.
- **Lista de email.** O maior ativo da loja própria não é a margem, é ter o email de quem comprou o volume I quando o volume II sair. A Amazon não te dá isso.

---

## Referências

- [Planos e preços da Nuvemshop](https://www.nuvemshop.com.br/planos-e-precos)
- [Plano Começo: quais funcionalidades terei acesso?](https://atendimento.nuvemshop.com.br/pt_BR/planos-da-nuvemshop/plano-comeco-quais-funcionalidades-terei-acesso)
- [Taxas e tarifas do Nuvem Pago](https://atendimento.nuvemshop.com.br/pt_BR/configuracoes-de-taxas-e-prazos/quais-sao-as-taxas-e-tarifas-do-nuvem-pago)
- [Vender produtos digitais na Nuvemshop](https://www.nuvemshop.com.br/vender/produtos-digitais) — caso um dia queira trazer o ebook para a loja própria
- [Amazon KDP](https://kdp.amazon.com/)

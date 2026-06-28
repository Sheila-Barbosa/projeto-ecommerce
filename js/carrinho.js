// Objetivo 1 - quando clicar no botão de adicionar ao carrinho temos que atualizar o contador, adicionar o produto no local storage e atualizar o html do carrinho
// parte 1 - vamos adicionar +1 no ícone do carrinho 
// passo 1 - pegar os botões de adicionar ao carrinho do html
const botoesAdicionarAoCarrinho = document.querySelectorAll('.adicionar-ao-carrinho');
// passo 2 - adicionar um evento de escuta nesses botões para quando clicar disparar uma ação
botoesAdicionarAoCarrinho.forEach((botao) => {
    botao.addEventListener('click', (evento) => {
        console.log('Botão de adicionar ao carrinho clicado!');
        // passo 3 - pega as informações do produto clicado e adicionar no local storage
        const elementoProduto = evento.target.closest('.produto');
        const produtoId = elementoProduto.dataset.id;
        const produtoNome = elementoProduto.querySelector('.nome').textContent;
        const produtoImagem = elementoProduto.querySelector('img').getAttribute('src');
        const produtoPreco = parseFloat(elementoProduto.querySelector('.preco').textContent.replace('R$', '').replace('.', ' ').replace(',', '.'));

        //buscar a lista de produtos do localstorage
        const carrinho = obterProdutosDoCarrinho();
        //testar se o produto já existe no carrinho
        const existeProduto = carrinho.find(produto => produto.id === produtoId);

        console.log(existeProduto);

        //Se existe produto, incrementar a quantidade
        If(existeProduto) {
            existeProduto.quantidade += 1;
        } Else {
            //se não existe, adicionar o produto com a quantidade 1 
            const produto = {
                id: produtoId,
                nome: produtoNome,
                imagem: produtoImagem,
                preco: produtoPreco,
                quantidade: 1,
            };
            carrinho.push(produto);
        }

        salvarProdutosNoCarrinho(carrinho);

    });
});

function salvarProdutosNoCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem('carrinho');
    return produtos ? JSON.parse(produtos) : [];
}



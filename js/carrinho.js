const CHAVE_CARRINHO = 'carrinho';
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const listaProdutos = document.querySelector('.produtos ul');
const corpoTabela = document.querySelector('#modal-1-content table tbody');
const contadorCarrinho = document.getElementById('contador-carrinho');
const totalCarrinho = document.getElementById('total-carrinho');

function obterProdutosDoCarrinho() {
    const dadosSalvos = localStorage.getItem(CHAVE_CARRINHO);
    const produtos = dadosSalvos ? JSON.parse(dadosSalvos) : [];

    // Validar a estrutura evita que dados inválidos do armazenamento quebrem as operações seguintes.
    if (!Array.isArray(produtos)) {
        throw new TypeError('Os dados salvos no carrinho precisam ser uma lista.');
    }

    return produtos;
}

function salvarProdutosNoCarrinho(produtos) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(produtos));
}

function formatarMoeda(valor) {
    return formatadorMoeda.format(valor);
}

function obterPrecoDoElemento(elementoProduto) {
    const textoPreco = elementoProduto.querySelector('.produtoPreco').textContent;
    // Remover os separadores brasileiros corretamente também suporta valores como "R$ 1.299,90".
    return Number(textoPreco.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
}

function adicionarProdutoAoCarrinho(elementoProduto) {
    const id = elementoProduto.dataset.id;
    const carrinho = obterProdutosDoCarrinho();
    const produtoExistente = carrinho.find((produto) => produto.id === id);

    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({
            id,
            nome: elementoProduto.querySelector('.nome').textContent.trim(),
            imagem: elementoProduto.querySelector('img').getAttribute('src'),
            preco: obterPrecoDoElemento(elementoProduto),
            quantidade: 1,
        });
    }

    salvarProdutosNoCarrinho(carrinho);
    atualizarCarrinhoETabela();
}

// Delegação de eventos mantém os botões funcionais mesmo se os produtos forem inseridos depois.
listaProdutos.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.adicionar-ao-carrinho');
    if (!botao) return;

    const elementoProduto = botao.closest('.produto');
    if (elementoProduto) adicionarProdutoAoCarrinho(elementoProduto);
});

function atualizarContadorCarrinho(produtos) {
    const quantidadeTotal = produtos.reduce((total, produto) => total + produto.quantidade, 0);
    contadorCarrinho.textContent = quantidadeTotal;
}

function criarCelula(classe, conteudo) {
    const celula = document.createElement('td');
    if (classe) celula.className = classe;
    if (conteudo instanceof Node) {
        celula.appendChild(conteudo);
    } else {
        celula.textContent = conteudo;
    }
    return celula;
}

function renderizarTabelaCarrinho(produtos) {
    // Construir os elementos com APIs do DOM evita interpretar nomes como HTML.
    corpoTabela.replaceChildren();

    produtos.forEach((produto) => {
        const linha = document.createElement('tr');
        const imagem = document.createElement('img');
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;

        const quantidade = document.createElement('input');
        quantidade.type = 'number';
        quantidade.className = 'input-quantidade';
        quantidade.dataset.id = produto.id;
        quantidade.min = '1';
        quantidade.step = '1';
        quantidade.value = produto.quantidade;

        const botaoRemover = document.createElement('button');
        botaoRemover.type = 'button';
        botaoRemover.className = 'btn-remover';
        botaoRemover.dataset.id = produto.id;
        botaoRemover.setAttribute('aria-label', `Remover ${produto.nome} do carrinho`);

        linha.append(
            criarCelula('td-produto', imagem),
            criarCelula('td-descricao', produto.nome),
            criarCelula('td-preco-unitario', formatarMoeda(produto.preco)),
            criarCelula('td-quantidade', quantidade),
            criarCelula('td-preco-total', formatarMoeda(produto.preco * produto.quantidade)),
            criarCelula('', botaoRemover),
        );
        corpoTabela.appendChild(linha);
    });
}

function atualizarValorTotalCarrinho(produtos) {
    const total = produtos.reduce(
        (soma, produto) => soma + produto.preco * produto.quantidade,
        0,
    );
    totalCarrinho.textContent = `Total: ${formatarMoeda(total)}`;
}

function atualizarCarrinhoETabela() {
    const produtos = obterProdutosDoCarrinho();
    atualizarContadorCarrinho(produtos);
    renderizarTabelaCarrinho(produtos);
    atualizarValorTotalCarrinho(produtos);
}

// Eventos delegados no tbody continuam funcionando após a tabela ser reconstruída.
corpoTabela.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.btn-remover');
    if (!botao) return;

    const carrinhoAtualizado = obterProdutosDoCarrinho()
        .filter((produto) => produto.id !== botao.dataset.id);
    salvarProdutosNoCarrinho(carrinhoAtualizado);
    atualizarCarrinhoETabela();
});

corpoTabela.addEventListener('change', (evento) => {
    const campoQuantidade = evento.target.closest('.input-quantidade');
    if (!campoQuantidade) return;

    const novaQuantidade = Number(campoQuantidade.value);
    // Quantidades fracionárias, vazias ou menores que um não são persistidas.
    if (!Number.isInteger(novaQuantidade) || novaQuantidade < 1) {
        atualizarCarrinhoETabela();
        return;
    }

    const produtos = obterProdutosDoCarrinho();
    const produto = produtos.find((item) => item.id === campoQuantidade.dataset.id);
    if (!produto) return;

    produto.quantidade = novaQuantidade;
    salvarProdutosNoCarrinho(produtos);
    atualizarCarrinhoETabela();
});

atualizarCarrinhoETabela();

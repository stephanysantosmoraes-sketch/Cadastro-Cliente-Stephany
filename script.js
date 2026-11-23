// Classe que representa um cliente do sistema.
class Cliente {
  constructor(nome, email, telefone, cidade, cpf = "") {
    this.id = Date.now().toString() + Math.random().toString(16).slice(2);
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.cidade = cidade;
    this.cpf = cpf;
  }
}

// Classe responsável por cadastrar, consultar, atualizar e excluir clientes.
class GerenciadorClientes {
  constructor() {
    this.clientes = this.carregarDoLocalStorage();
  }

  carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem("clientes");
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  }

  salvarNoLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(this.clientes));
  }

  cadastrar(cliente) {
    const emailExiste = this.clientes.some(
      item => item.email.toLowerCase() === cliente.email.toLowerCase()
    );

    if (emailExiste) {
      alert("Já existe um cliente cadastrado com esse e-mail.");
      return false;
    }

    this.clientes.push(cliente);
    this.salvarNoLocalStorage();
    return true;
  }

  consultar() {
    return [...this.clientes].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }

  atualizar(id, dadosAtualizados) {
    const emailExiste = this.clientes.some(
      item => item.id !== id &&
        item.email.toLowerCase() === dadosAtualizados.email.toLowerCase()
    );

    if (emailExiste) {
      alert("Outro cliente já está utilizando esse e-mail.");
      return false;
    }

    const indice = this.clientes.findIndex(item => item.id === id);
    if (indice === -1) return false;

    this.clientes[indice] = { ...this.clientes[indice], ...dadosAtualizados };
    this.salvarNoLocalStorage();
    return true;
  }

  excluir(id) {
    this.clientes = this.clientes.filter(item => item.id !== id);
    this.salvarNoLocalStorage();
  }

  limparTodos() {
    this.clientes = [];
    this.salvarNoLocalStorage();
  }

  pesquisar(termo) {
    const pesquisa = termo.toLowerCase().trim();

    return this.consultar().filter(cliente =>
      cliente.nome.toLowerCase().includes(pesquisa) ||
      cliente.email.toLowerCase().includes(pesquisa)
    );
  }
}

// Instância do gerenciador: é o objeto que controla os registros.
const gerenciador = new GerenciadorClientes();

// Elementos da página.
const formulario = document.getElementById("formCliente");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoTelefone = document.getElementById("telefone");
const campoCidade = document.getElementById("cidade");
const campoCpf = document.getElementById("cpf");
const corpoTabela = document.getElementById("corpoTabela");
const totalClientes = document.getElementById("totalClientes");
const pesquisa = document.getElementById("pesquisa");
const mensagemVazia = document.getElementById("mensagemVazia");
const tituloFormulario = document.getElementById("tituloFormulario");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoCancelar = document.getElementById("botaoCancelar");
const botaoOrdenar = document.getElementById("botaoOrdenar");
const botaoLimparTudo = document.getElementById("botaoLimparTudo");

let idEmEdicao = null;

// Mostra os clientes na tabela e atualiza a quantidade total.
function renderizarClientes(lista = gerenciador.consultar()) {
  corpoTabela.innerHTML = "";
  totalClientes.textContent = gerenciador.clientes.length;

  mensagemVazia.style.display = lista.length === 0 ? "block" : "none";
  mensagemVazia.textContent = gerenciador.clientes.length === 0
    ? "Nenhum cliente cadastrado ainda."
    : "Nenhum cliente encontrado para essa pesquisa.";

  lista.forEach(cliente => {
    const linha = document.createElement("tr");

    // textContent evita interpretar os dados digitados como código HTML.
    const valores = [
      cliente.nome,
      cliente.email,
      cliente.telefone,
      cliente.cidade,
      cliente.cpf || "—"
    ];

    valores.forEach(valor => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      linha.appendChild(celula);
    });

    const celulaAcoes = document.createElement("td");
    const grupoBotoes = document.createElement("div");
    grupoBotoes.className = "acoes-tabela";

    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "botao-acao editar";
    botaoEditar.textContent = "Editar";
    botaoEditar.addEventListener("click", () => iniciarEdicao(cliente.id));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-acao excluir";
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.addEventListener("click", () => excluirCliente(cliente.id));

    grupoBotoes.append(botaoEditar, botaoExcluir);
    celulaAcoes.appendChild(grupoBotoes);
    linha.appendChild(celulaAcoes);
    corpoTabela.appendChild(linha);
  });
}

// Lê os valores digitados no formulário.
function obterDadosFormulario() {
  return {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    telefone: campoTelefone.value.trim(),
    cidade: campoCidade.value.trim(),
    cpf: campoCpf.value.trim()
  };
}

// Cadastra um cliente ou salva as alterações de um cliente existente.
formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  if (!formulario.reportValidity()) return;

  const dados = obterDadosFormulario();

  if (idEmEdicao) {
    const atualizado = gerenciador.atualizar(idEmEdicao, dados);
    if (!atualizado) return;
    alert("Cliente atualizado com sucesso!");
  } else {
    const novoCliente = new Cliente(
      dados.nome,
      dados.email,
      dados.telefone,
      dados.cidade,
      dados.cpf
    );

    const cadastrado = gerenciador.cadastrar(novoCliente);
    if (!cadastrado) return;
    alert("Cliente cadastrado com sucesso!");
  }

  cancelarEdicao();
  renderizarClientes();
});

// Preenche o formulário com os dados do cliente escolhido.
function iniciarEdicao(id) {
  const cliente = gerenciador.clientes.find(item => item.id === id);
  if (!cliente) return;

  idEmEdicao = id;
  campoNome.value = cliente.nome;
  campoEmail.value = cliente.email;
  campoTelefone.value = cliente.telefone;
  campoCidade.value = cliente.cidade;
  campoCpf.value = cliente.cpf || "";

  tituloFormulario.textContent = "Editar cliente";
  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.classList.remove("escondido");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  campoNome.focus();
}

// Volta o formulário ao modo de cadastro.
function cancelarEdicao() {
  idEmEdicao = null;
  formulario.reset();
  tituloFormulario.textContent = "Cadastrar cliente";
  botaoSalvar.textContent = "Cadastrar cliente";
  botaoCancelar.classList.add("escondido");
}

botaoCancelar.addEventListener("click", cancelarEdicao);

// Exclui um cliente somente depois da confirmação do usuário.
function excluirCliente(id) {
  const cliente = gerenciador.clientes.find(item => item.id === id);
  if (!cliente) return;

  const confirmou = confirm(`Tem certeza de que deseja excluir ${cliente.nome}?`);
  if (confirmou) {
    gerenciador.excluir(id);
    if (idEmEdicao === id) cancelarEdicao();
    renderizarClientes(pesquisa.value ? gerenciador.pesquisar(pesquisa.value) : undefined);
  }
}

// Pesquisa pelo nome ou pelo e-mail enquanto o usuário digita.
pesquisa.addEventListener("input", function() {
  renderizarClientes(gerenciador.pesquisar(pesquisa.value));
});

// A lista já é apresentada em ordem alfabética; este botão reforça a organização.
botaoOrdenar.addEventListener("click", function() {
  pesquisa.value = "";
  renderizarClientes(gerenciador.consultar());
});

// Apaga todos os registros depois de uma confirmação.
botaoLimparTudo.addEventListener("click", function() {
  if (gerenciador.clientes.length === 0) {
    alert("Não há clientes cadastrados para limpar.");
    return;
  }

  const confirmou = confirm("Tem certeza de que deseja excluir TODOS os clientes? Essa ação não pode ser desfeita.");
  if (confirmou) {
    gerenciador.limparTodos();
    cancelarEdicao();
    pesquisa.value = "";
    renderizarClientes();
  }
});

// Exibe os registros que já estavam salvos quando a página é aberta.
renderizarClientes();

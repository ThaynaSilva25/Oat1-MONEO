let movimentacaoEditando = null;


// READ - Buscar movimentações


async function carregarMovimentacoes() {

    const resposta = await fetch("/api/movimentacoes");

    const movimentacoes = await resposta.json();

    mostrarMovimentacoes(movimentacoes);

    atualizarResumo(movimentacoes);
}



// READ - Mostrar na tela


function mostrarMovimentacoes(movimentacoes) {

    const lista = document.getElementById(
        "listaMovimentacoes"
    );

    lista.innerHTML = "";

    if (movimentacoes.length === 0) {

        lista.innerHTML = `
            <div class="sem-movimentacoes">
                Nenhuma movimentação cadastrada.
            </div>
        `;

        return;
    }

    movimentacoes.forEach(movimentacao => {

        const div = document.createElement("div");

        div.classList.add("movimentacao");

        const sinal =
            movimentacao.tipo === "entrada"
                ? "+"
                : "-";

        div.innerHTML = `

            <div class="info">

                <h3>
                    ${movimentacao.descricao}
                </h3>

                <span>
                    ${movimentacao.tipo === "entrada"
                        ? "Entrada"
                        : "Saída"}
                </span>

            </div>

            <div>

                <span class="valor ${movimentacao.tipo}">
                    ${sinal} R$ ${Number(
                        movimentacao.valor
                    ).toFixed(2)}
                </span>

                <span class="acoes">

                    <button
                        class="btn-editar"
                        onclick="editarMovimentacao(${movimentacao.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirMovimentacao(${movimentacao.id})"
                    >
                        Excluir
                    </button>

                </span>

            </div>
        `;

        lista.appendChild(div);
    });
}



// RESUMO FINANCEIRO


function atualizarResumo(movimentacoes) {

    let entradas = 0;
    let saidas = 0;

    movimentacoes.forEach(movimentacao => {

        if (movimentacao.tipo === "entrada") {
            entradas += Number(movimentacao.valor);
        } else {
            saidas += Number(movimentacao.valor);
        }

    });

    const saldo = entradas - saidas;

    document.getElementById("entradas").innerText =
        formatarMoeda(entradas);

    document.getElementById("saidas").innerText =
        formatarMoeda(saidas);

    document.getElementById("saldo").innerText =
        formatarMoeda(saldo);
}



// FORMATAR MOEDA


function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}



// CREATE - Adicionar


document.getElementById("formulario")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const descricao =
            document.getElementById("descricao").value;

        const valor =
            document.getElementById("valor").value;

        const tipo =
            document.getElementById("tipo").value;


        // Se estiver editando
        if (movimentacaoEditando !== null) {

            await fetch(
                `/api/movimentacoes/${movimentacaoEditando}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        descricao,
                        valor,
                        tipo
                    })
                }
            );

            movimentacaoEditando = null;

            document.getElementById(
                "botaoSalvar"
            ).innerText = "Adicionar";

            document.getElementById(
                "botaoCancelar"
            ).style.display = "none";

            document.getElementById(
                "tituloFormulario"
            ).innerText = "Adicionar movimentação";

        }

        // CREATE
        else {

            await fetch(
                "/api/movimentacoes",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        descricao,
                        valor,
                        tipo
                    })
                }
            );
        }

        limparFormulario();

        carregarMovimentacoes();

    });



// UPDATE - Editar


async function editarMovimentacao(id) {

    const resposta =
        await fetch("/api/movimentacoes");

    const movimentacoes =
        await resposta.json();

    const movimentacao =
        movimentacoes.find(item => item.id === id);

    if (!movimentacao) {
        return;
    }

    document.getElementById("descricao").value =
        movimentacao.descricao;

    document.getElementById("valor").value =
        movimentacao.valor;

    document.getElementById("tipo").value =
        movimentacao.tipo;

    movimentacaoEditando = id;

    document.getElementById(
        "botaoSalvar"
    ).innerText = "Salvar alteração";

    document.getElementById(
        "botaoCancelar"
    ).style.display = "inline-block";

    document.getElementById(
        "tituloFormulario"
    ).innerText = "Editar movimentação";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}



// DELETE - Excluir


async function excluirMovimentacao(id) {

    const confirmar = confirm(
        "Deseja realmente excluir esta movimentação?"
    );

    if (!confirmar) {
        return;
    }

    await fetch(
        `/api/movimentacoes/${id}`,
        {
            method: "DELETE"
        }
    );

    carregarMovimentacoes();
}



// CANCELAR EDIÇÃO


function cancelarEdicao() {

    movimentacaoEditando = null;

    limparFormulario();

    document.getElementById(
        "botaoSalvar"
    ).innerText = "Adicionar";

    document.getElementById(
        "botaoCancelar"
    ).style.display = "none";

    document.getElementById(
        "tituloFormulario"
    ).innerText = "Adicionar movimentação";
}



// LIMPAR FORMULÁRIO


function limparFormulario() {

    document.getElementById(
        "descricao"
    ).value = "";

    document.getElementById(
        "valor"
    ).value = "";

    document.getElementById(
        "tipo"
    ).value = "";
}


// ===============================
// INICIAR SISTEMA
// ===============================

carregarMovimentacoes();

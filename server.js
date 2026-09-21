const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Array utilizado como banco de dados
let movimentacoes = [
    {
        id: 1,
        descricao: "Salário",
        valor: 1500,
        tipo: "entrada"
    },
    {
        id: 2,
        descricao: "Alimentação",
        valor: 250,
        tipo: "saida"
    }
];

// CREATE - Criar movimentação
function criarMovimentacao(dados) {
    const novaMovimentacao = {
        id: movimentacoes.length > 0
            ? movimentacoes[movimentacoes.length - 1].id + 1
            : 1,
        descricao: dados.descricao,
        valor: Number(dados.valor),
        tipo: dados.tipo
    };

    movimentacoes.push(novaMovimentacao);

    return novaMovimentacao;
}

// READ - Listar movimentações
function listarMovimentacoes() {
    return movimentacoes;
}

// READ - Buscar movimentação por ID
function buscarMovimentacao(id) {
    return movimentacoes.find(
        movimentacao => movimentacao.id === Number(id)
    );
}

// UPDATE - Atualizar movimentação
function atualizarMovimentacao(id, dados) {
    const indice = movimentacoes.findIndex(
        movimentacao => movimentacao.id === Number(id)
    );

    if (indice === -1) {
        return null;
    }

    movimentacoes[indice] = {
        id: Number(id),
        descricao: dados.descricao,
        valor: Number(dados.valor),
        tipo: dados.tipo
    };

    return movimentacoes[indice];
}

// DELETE - Excluir movimentação
function excluirMovimentacao(id) {
    const indice = movimentacoes.findIndex(
        movimentacao => movimentacao.id === Number(id)
    );

    if (indice === -1) {
        return false;
    }

    movimentacoes.splice(indice, 1);

    return true;
}

// Função para enviar resposta JSON
function responderJSON(res, statusCode, dados) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(dados));
}

// Servidor
const server = http.createServer((req, res) => {

    // FRONT-END
    if (req.method === "GET" && req.url === "/") {
        const arquivo = path.join(__dirname, "public", "index.html");

        fs.readFile(arquivo, (erro, conteudo) => {
            if (erro) {
                res.writeHead(500);
                res.end("Erro ao carregar a página.");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });

            res.end(conteudo);
        });

        return;
    }

    // CSS
    if (req.method === "GET" && req.url === "/style.css") {
        const arquivo = path.join(__dirname, "public", "style.css");

        fs.readFile(arquivo, (erro, conteudo) => {
            if (erro) {
                res.writeHead(404);
                res.end("CSS não encontrado.");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/css"
            });

            res.end(conteudo);
        });

        return;
    }

    // JAVASCRIPT DO FRONT-END
    if (req.method === "GET" && req.url === "/script.js") {
        const arquivo = path.join(__dirname, "public", "script.js");

        fs.readFile(arquivo, (erro, conteudo) => {
            if (erro) {
                res.writeHead(404);
                res.end("JavaScript não encontrado.");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/javascript"
            });

            res.end(conteudo);
        });

        return;
    }

    // =========================
    // API - READ
    // =========================

    if (req.method === "GET" && req.url === "/api/movimentacoes") {
        responderJSON(res, 200, listarMovimentacoes());
        return;
    }

    // =========================
    // API - CREATE
    // =========================

    if (req.method === "POST" && req.url === "/api/movimentacoes") {

        let corpo = "";

        req.on("data", parte => {
            corpo += parte;
        });

        req.on("end", () => {

            try {
                const dados = JSON.parse(corpo);

                if (!dados.descricao || !dados.valor || !dados.tipo) {
                    responderJSON(res, 400, {
                        erro: "Preencha todos os campos."
                    });
                    return;
                }

                const novaMovimentacao = criarMovimentacao(dados);

                responderJSON(res, 201, novaMovimentacao);

            } catch (erro) {
                responderJSON(res, 400, {
                    erro: "Dados inválidos."
                });
            }
        });

        return;
    }

    // =========================
    // API - UPDATE
    // =========================

    if (
        req.method === "PUT" &&
        req.url.startsWith("/api/movimentacoes/")
    ) {

        const id = req.url.split("/").pop();

        let corpo = "";

        req.on("data", parte => {
            corpo += parte;
        });

        req.on("end", () => {

            try {
                const dados = JSON.parse(corpo);

                const movimentacaoAtualizada =
                    atualizarMovimentacao(id, dados);

                if (!movimentacaoAtualizada) {
                    responderJSON(res, 404, {
                        erro: "Movimentação não encontrada."
                    });
                    return;
                }

                responderJSON(res, 200, movimentacaoAtualizada);

            } catch (erro) {
                responderJSON(res, 400, {
                    erro: "Dados inválidos."
                });
            }
        });

        return;
    }

    // =========================
    // API - DELETE
    // =========================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/movimentacoes/")
    ) {

        const id = req.url.split("/").pop();

        const excluida = excluirMovimentacao(id);

        if (!excluida) {
            responderJSON(res, 404, {
                erro: "Movimentação não encontrada."
            });
            return;
        }

        responderJSON(res, 200, {
            mensagem: "Movimentação excluída com sucesso."
        });

        return;
    }

    // Rota não encontrada
    responderJSON(res, 404, {
        erro: "Rota não encontrada."
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
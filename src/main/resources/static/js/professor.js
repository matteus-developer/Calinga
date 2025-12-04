
// =============================
// Seletores e Variáveis Globais
// =============================
const formProfessor = document.querySelector("#formProfessor");
const idNomeProfessor = document.querySelector("#idNomeProfessor"); 
const idEmailProfessor = document.querySelector("#idEmailProfessor");
const idSenhaProfessor = document.querySelector("#idSenhaProfessor");
const idMatriProfessor = document.querySelector("#idMatriProfessor"); 
const idTipoProfessor = document.querySelector("#idTipoProfessor");
const tabelaBody = document.querySelector("#tableDisciplina tbody"); 

// Variável injetada pelo Thymeleaf
const isCoordenador = typeof IS_COORDENADOR !== 'undefined' ? IS_COORDENADOR : false;

console.log('👤 É coordenador?', isCoordenador);

// =============================
// LISTAR DISCIPLINAS
// =============================
async function listarDisciplinas() {
    try {
        const response = await fetch("/disciplina/list");
        const disciplinas = await response.json();

        tabelaBody.innerHTML = "";
        disciplinas.forEach(d => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${d.idDisciplina}</td>
                <td>${d.nomeDisciplina}</td>
                <td><input type="checkbox" class="check-disciplina" value="${d.idDisciplina}"></td>
            `;
            tabelaBody.appendChild(linha);
        });
    } catch (err) {
        console.error("Erro ao listar disciplinas:", err);
    }
}

// =============================
// LISTAR PROFESSORES
// =============================
async function listarProfessores() {
    try {
        const response = await fetch("/professor/list");
        const professores = await response.json();

        const tbody = document.querySelector("#tableProfessor tbody");
        tbody.innerHTML = "";

        professores.forEach(p => {
            const tipoTexto = p.tipoProfessor === 1 ? "Coordenador" : "Professor";

            const actionsHtml = isCoordenador ? `
                <button class="btn-editar" data-id="${p.idProfessor}">Editar</button>
                <button class="btn-excluir" data-id="${p.idProfessor}">Excluir</button>
            ` : 'N/A';

            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${p.idProfessor}</td>
                <td>${p.nomeProfessor}</td>
                <td>${p.matriProfessor}</td>                 
                <td>${tipoTexto}</td>
                <td>${actionsHtml}</td>
            `;
            tbody.appendChild(linha);
        });

    } catch (err) {
        console.error("Erro ao listar professores:", err);
    }
}

// =============================
// SALVAR PROFESSOR
// =============================
function salvarProfessor() {
    if (!isCoordenador) {
        alert("Você não tem permissão.");
        return;
    }

    const professorDTO = {
        nomeProfessor: idNomeProfessor.value,
        emailProfessor: idEmailProfessor.value,
        senhaProfessor: idSenhaProfessor.value,
        matriProfessor: idMatriProfessor.value,
        tipoProfessor: parseInt(idTipoProfessor.value),
        idsDisciplinas: [...document.querySelectorAll(".check-disciplina:checked")].map(c => parseInt(c.value))
    };

    fetch("/professor/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(professorDTO)
    })
    .then(() => {
        alert("Professor cadastrado!");
        listarProfessores();
    })
    .catch(err => console.error("Erro ao salvar:", err));
}

// =============================
// DELEGAÇÃO DE EVENTOS (EDITAR / EXCLUIR)
// =============================
document.addEventListener("click", function (event) {

    if (event.target.classList.contains("btn-editar")) {
        const id = event.target.dataset.id;
        abrirModalEdicao(id);
    }

    if (event.target.classList.contains("btn-excluir")) {
        const id = event.target.dataset.id;
        if (confirm("Deseja excluir este professor?")) {
            excluirProfessor(id);
        }
    }
});

// =============================
// ABRIR MODAL DE EDIÇÃO
// =============================
function abrirModalEdicao(id) {
    fetch(`/professor/${id}`)
        .then(res => res.json())
        .then(p => {
            document.getElementById("editIdProfessor").value = p.idProfessor;
            document.getElementById("editNomeProfessor").value = p.nomeProfessor;
            document.getElementById("editEmailProfessor").value = p.emailProfessor;
            document.getElementById("editSenhaProfessor").value = "";
            document.getElementById("editMatriProfessor").value = p.matriProfessor;
            document.getElementById("editTipoProfessor").value = p.tipoProfessor;

            document.getElementById("modalEditar").style.display = "flex";
        })
        .catch(err => console.error("Erro ao abrir edição:", err));
}

// =============================
// EXCLUIR PROFESSOR
// =============================
function excluirProfessor(id) {
    fetch(`/professor/excluir/${id}`, { method: "DELETE" })
        .then(() => {
            alert("Professor excluído!");
            listarProfessores();
        })
        .catch(err => console.error("Erro ao excluir:", err));
}

// =============================
// ATUALIZAR PROFESSOR
// =============================
document.getElementById("formEditarProfessor").addEventListener("submit", function (e) {
    e.preventDefault();

    const professorDTO = {
        idProfessor: document.getElementById("editIdProfessor").value,
        nomeProfessor: document.getElementById("editNomeProfessor").value,
        emailProfessor: document.getElementById("editEmailProfessor").value,
        senhaProfessor: document.getElementById("editSenhaProfessor").value,
        matriProfessor: document.getElementById("editMatriProfessor").value,
        tipoProfessor: document.getElementById("editTipoProfessor").value
    };

    fetch("/professor/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(professorDTO)
    })
    .then(() => {
        alert("Professor atualizado!");
        document.getElementById("modalEditar").style.display = "none";
        listarProfessores();
    })
    .catch(err => console.error("Erro ao atualizar:", err));
});

// =============================
// CANCELAR MODAL
// =============================
document.getElementById("btnCancelar").addEventListener("click", () => {
    document.getElementById("modalEditar").style.display = "none";
});

// =============================
// EVENTOS
// =============================
if (formProfessor) {
    formProfessor.addEventListener("submit", function(e) {
        e.preventDefault();
        salvarProfessor();
    });
}

const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.onclick = () => window.location.href = "/menu";
}

// =============================
// INICIALIZAÇÃO
// =============================
document.addEventListener("DOMContentLoaded", () => {
    listarDisciplinas();
    listarProfessores();
});

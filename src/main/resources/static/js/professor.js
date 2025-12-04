// =============================
// Seletores e Variáveis Globais
// =============================
const formProfessor = document.querySelector("#formProfessor");
const idNomeProfessor = document.querySelector("#idNomeProfessor"); 
const idEmailProfessor = document.querySelector("#idEmailProfessor");
const idSenhaProfessor = document.querySelector("#idSenhaProfessor");
const idMatriProfessor = document.querySelector("#idMatriProfessor"); 
const idTipoProfessor = document.querySelector("#idTipoProfessor");
const tabelaDisciplinaBody = document.querySelector("#tableDisciplina tbody");
const tabelaProfessorBody = document.querySelector("#tableProfessor tbody");

const modalEditar = document.getElementById("modalEditar");
const editListaDisciplinas = document.getElementById("editListaDisciplinas");

// Variável injetada pelo Thymeleaf
const isCoordenador = typeof IS_COORDENADOR !== 'undefined' ? IS_COORDENADOR : false;

console.log('👤 É coordenador?', isCoordenador);

// =============================
// HELPERS
// =============================
function safeJsonParse(text) {
    try { return JSON.parse(text); } catch(e) { return null; }
}

// =============================
// LISTAR DISCIPLINAS (tabela principal)
// =============================
async function listarDisciplinas() {
    try {
        const res = await fetch("/disciplina/list", { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Status ' + res.status);
        const disciplinas = await res.json();
        tabelaDisciplinaBody.innerHTML = "";
        disciplinas.forEach(d => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${d.idDisciplina}</td>
                <td>${d.nomeDisciplina}</td>
                <td><input type="checkbox" class="check-disciplina" value="${d.idDisciplina}"></td>
            `;
            tabelaDisciplinaBody.appendChild(linha);
        });
    } catch (err) {
        console.error("Erro ao listar disciplinas:", err);
        tabelaDisciplinaBody.innerHTML = `<tr><td colspan="3">Erro ao carregar disciplinas</td></tr>`;
    }
}

// =============================
// LISTAR PROFESSORES (tabela principal)
// =============================
async function listarProfessores() {
    try {
        const res = await fetch("/professor/list", { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Status ' + res.status);
        const professores = await res.json();
        tabelaProfessorBody.innerHTML = "";

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
            tabelaProfessorBody.appendChild(linha);
        });
    } catch (err) {
        console.error("Erro ao listar professores:", err);
        tabelaProfessorBody.innerHTML = `<tr><td colspan="5">Erro ao carregar professores</td></tr>`;
    }
}

// =============================
// SALVAR PROFESSOR (novo) - inalterado exceto credentials
// =============================
function salvarProfessor() {
    if (!isCoordenador) { alert("Você não tem permissão."); return; }
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
        credentials: 'same-origin',
        body: JSON.stringify(professorDTO)
    })
    .then(res => {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
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
// ABRIR MODAL DE EDIÇÃO - busca professor + disciplinas e marca checkboxes
// =============================
async function abrirModalEdicao(id) {
    try {
        console.log("Abrindo edição para id:", id);

        // Busca professor
        const [resP, resD] = await Promise.all([
            fetch(`/professor/${id}`, { credentials: 'same-origin' }),
            fetch(`/disciplina/list`, { credentials: 'same-origin' })
        ]);

        if (!resP.ok) throw new Error('Erro ao buscar professor: ' + resP.status);
        if (!resD.ok) throw new Error('Erro ao buscar disciplinas: ' + resD.status);

        const professor = await resP.json();
        const disciplinas = await resD.json();

        // Preenche campos básicos
        document.getElementById("editIdProfessor").value = professor.idProfessor;
        document.getElementById("editNomeProfessor").value = professor.nomeProfessor;
        document.getElementById("editEmailProfessor").value = professor.emailProfessor;
        document.getElementById("editSenhaProfessor").value = "";
        document.getElementById("editMatriProfessor").value = professor.matriProfessor;
        document.getElementById("editTipoProfessor").value = professor.tipoProfessor;

        // Renderiza lista de disciplinas com checkboxes marcados se atribuído
        editListaDisciplinas.innerHTML = "";
        const assignedIds = (professor.idsDisciplinas || []).map(Number);
        disciplinas.forEach(d => {
            const wrapper = document.createElement("div");
            wrapper.className = "edit-disciplina-row";
            const checked = assignedIds.includes(d.idDisciplina) ? "checked" : "";
            wrapper.innerHTML = `
                <label>
                    <input type="checkbox" class="edit-check-disciplina" value="${d.idDisciplina}" ${checked}>
                    ${d.nomeDisciplina}
                </label>
            `;
            editListaDisciplinas.appendChild(wrapper);
        });

        // Exibe modal
        modalEditar.style.display = "flex";

    } catch (err) {
        console.error("Erro ao abrir modal de edição:", err);
        alert("Erro ao abrir edição: " + err.message);
    }
}

// =============================
// EXCLUIR PROFESSOR
// =============================
async function excluirProfessor(id) {
    try {
        const res = await fetch(`/professor/excluir/${id}`, {
            method: "DELETE",
            credentials: 'same-origin'
        });
        if (!res.ok) throw new Error('Status ' + res.status);
        alert("Professor excluído!");
        listarProfessores();
    } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Erro ao excluir professor");
    }
}

// =============================
// ATUALIZAR PROFESSOR - coleta disciplinas do modal e faz PUT
// =============================
document.getElementById("formEditarProfessor").addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        const idProfessor = document.getElementById("editIdProfessor").value;
        const idsDisciplinas = [...document.querySelectorAll(".edit-check-disciplina:checked")].map(c => parseInt(c.value));

        const professorDTO = {
            idProfessor: parseInt(idProfessor),
            nomeProfessor: document.getElementById("editNomeProfessor").value,
            emailProfessor: document.getElementById("editEmailProfessor").value,
            senhaProfessor: document.getElementById("editSenhaProfessor").value,
            matriProfessor: document.getElementById("editMatriProfessor").value,
            tipoProfessor: parseInt(document.getElementById("editTipoProfessor").value),
            idsDisciplinas: idsDisciplinas
        };

        console.log("Enviando atualização:", professorDTO);

        const res = await fetch("/professor/atualizar", {
            method: "PUT",
            credentials: 'same-origin',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(professorDTO)
        });

        console.log("Resposta PUT status:", res.status);

        if (res.status === 405) {
            // Caso você esteja vendo PUT -> /tela/login nos logs, possivelmente há um conflito de rota/rotina
            throw new Error("Método PUT não suportado pelo endpoint. Verifique se /professor/atualizar existe e aceita PUT.");
        }

        if (!res.ok) throw new Error('Status ' + res.status);

        alert("Professor atualizado!");
        modalEditar.style.display = "none";
        listarProfessores();

    } catch (err) {
        console.error("Erro ao atualizar:", err);
        alert("Erro ao atualizar professor: " + err.message);
    }
});

// =============================
// CANCELAR MODAL
// =============================
document.getElementById("btnCancelar").addEventListener("click", () => {
    modalEditar.style.display = "none";
});

// =============================
// EVENTOS DO FORMULARIO NOVO PROFESSOR
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

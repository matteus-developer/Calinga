// =============================
// Seletores
// =============================
const formProfessor = document.querySelector("#formProfessor");
const idNomeProfessor = document.querySelector("#idNomeProfessor"); 
const idEmailProfessor = document.querySelector("#idEmailProfessor");
const idSenhaProfessor = document.querySelector("#idSenhaProfessor");
const idMatriProfessor = document.querySelector("#idMatriProfessor"); 
const idTipoProfessor = document.querySelector("#idTipoProfessor");
const tabelaBody = document.querySelector("#tableDisciplina tbody");

// =============================
// SALVAR PROFESSOR
// =============================
function salvarProfessor() {

    if (!idNomeProfessor.value || !idEmailProfessor.value || 
        !idSenhaProfessor.value || !idMatriProfessor.value || 
        !idTipoProfessor.value) {
        alert("Preencha todos os campos.");
        return;
    }

    const tipo = parseInt(idTipoProfessor.value);

    if (tipo === 1) {
        fetch("/disciplina/list")
            .then(res => res.json())
            .then(disciplinas => {

                const idsDisciplinas = disciplinas.map(d => d.idDisciplina);

                const dto = {
                    nomeProfessor: idNomeProfessor.value,
                    emailProfessor: idEmailProfessor.value,
                    senhaProfessor: idSenhaProfessor.value,
                    matriProfessor: idMatriProfessor.value,
                    tipoProfessor: tipo,
                    idsDisciplinas
                };

                enviarProfessor(dto);
            });

    } else {
        const idsDisciplinas = [...document.querySelectorAll(".check-disciplina:checked")]
            .map(c => parseInt(c.value));

        const dto = {
            nomeProfessor: idNomeProfessor.value,
            emailProfessor: idEmailProfessor.value,
            senhaProfessor: idSenhaProfessor.value,
            matriProfessor: idMatriProfessor.value,
            tipoProfessor: tipo,
            idsDisciplinas
        };

        enviarProfessor(dto);
    }
}

function enviarProfessor(dto) {
    fetch("/professor/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar");
        return res.json();
    })
    .then(() => {
        alert("Professor salvo!");
        limparCamposProfessor();
        listarProfessores();
    })
    .catch(err => console.error(err));
}

// =============================
// LISTAR DISCIPLINAS
// =============================
function listarDisciplinas() {
    fetch("/disciplina/list")
        .then(res => res.json())
        .then(disciplinas => {
            tabelaBody.innerHTML = "";

            disciplinas.forEach(d => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${d.idDisciplina}</td>
                    <td>${d.nomeDisciplina}</td>
                    <td>
                        <input type="checkbox" class="check-disciplina" value="${d.idDisciplina}">
                    </td>
                `;
                tabelaBody.appendChild(linha);
            });
        });
}

// =============================
// LISTAR PROFESSORES
// =============================
function listarProfessores() {
    fetch("/professor/list")
        .then(res => res.json())
        .then(prof => {

            const tbody = document.querySelector("#tableProfessor tbody");
            tbody.innerHTML = "";

            prof.forEach(p => {
                const tipoTexto = p.tipoProfessor === 1 ? "Coordenador" : "Professor";

                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${p.idProfessor}</td>
                    <td>${p.nomeProfessor}</td>
                    <td>${p.matriProfessor}</td>                 
                    <td>${tipoTexto}</td>
                    <td>
                        <button class="btn-editar" data-id="${p.idProfessor}">Editar</button>
                        <button class="btn-excluir" data-id="${p.idProfessor}">Excluir</button>
                    </td>
                `;

                tbody.appendChild(linha);
            });
        });
}

// =============================
// ABRIR MODAL EDITAR
// =============================
document.addEventListener("click", function (e) {

    if (e.target.classList.contains("btn-editar")) {

        const id = e.target.dataset.id;

        fetch(`/professor/${id}`)
            .then(res => res.json())
            .then(professor => {

                document.querySelector("#editIdProfessor").value = professor.idProfessor;
                document.querySelector("#editNomeProfessor").value = professor.nomeProfessor;
                document.querySelector("#editEmailProfessor").value = professor.emailProfessor;
                document.querySelector("#editSenhaProfessor").value = professor.senhaProfessor;
                document.querySelector("#editMatriProfessor").value = professor.matriProfessor;
                document.querySelector("#editTipoProfessor").value = professor.tipoProfessor;

                fetch("/disciplina/list")
                    .then(res => res.json())
                    .then(disciplinas => {

                        const container = document.querySelector("#editListaDisciplinas");
                        container.innerHTML = "";

                        disciplinas.forEach(d => {

                            const checked = professor.disciplinas.some(pd => 
                                pd.idDisciplina === d.idDisciplina
                            );

                            const div = document.createElement("div");
                            div.innerHTML = `
                                <label>
                                    <input type="checkbox" class="edit-check-disciplina" value="${d.idDisciplina}"
                                    ${checked ? "checked" : ""}>
                                    ${d.nomeDisciplina}
                                </label>
                            `;
                            container.appendChild(div);
                        });

                        document.querySelector("#modalEditar").style.display = "flex";
                    });
            });
    }
});

// =============================
// ATUALIZAR PROFESSOR ✅ CORRIGIDO
// =============================
document.querySelector("#btnAtualizar").addEventListener("click", function () {

    const id = document.querySelector("#editIdProfessor").value;

    const idsDisciplinas = [...document.querySelectorAll(".edit-check-disciplina:checked")]
        .map(c => parseInt(c.value));

    const senhaDigitada = document.querySelector("#editSenhaProfessor").value;

    const dto = {
        nomeProfessor: document.querySelector("#editNomeProfessor").value,
        emailProfessor: document.querySelector("#editEmailProfessor").value,
        matriProfessor: document.querySelector("#editMatriProfessor").value,
        tipoProfessor: parseInt(document.querySelector("#editTipoProfessor").value),
        idsDisciplinas
    };

    if (senhaDigitada && senhaDigitada.trim() !== "") {
    dto.senhaProfessor = senhaDigitada;
}

    fetch(`/professor/atualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    })
    ..then(res => {
    if (res.status === 200 || res.status === 204) {
        alert("Professor atualizado!");
        document.querySelector("#modalEditar").style.display = "none";
        listarProfessores();
    } else {
        return res.text().then(msg => {
            throw new Error(msg || "Erro ao atualizar");
        });
    }
})
.catch(err => {
    console.error(err);
    alert(err.message);
});

// =============================
// EXCLUIR PROFESSOR
// =============================
document.addEventListener("click", function (e) {

    if (e.target.classList.contains("btn-excluir")) {

        const id = e.target.dataset.id;

        if (confirm("Deseja excluir?")) {
            fetch(`/professor/excluir/${id}`, { method: "DELETE" })
                .then(res => {
                    if (!res.ok) throw new Error();
                    alert("Excluído!");
                    listarProfessores();
                })
                .catch(() => alert("Erro ao excluir"));
        }
    }
});

// =============================
// FECHAR MODAL
// =============================
document.querySelector("#btnCancelar").addEventListener("click", () => {
    document.querySelector("#modalEditar").style.display = "none";
});

// =============================
// INICIALIZAÇÃO
// =============================
formProfessor.addEventListener("submit", e => {
    e.preventDefault();
    salvarProfessor();
});

document.addEventListener("DOMContentLoaded", () => {
    listarDisciplinas();
    listarProfessores();
});

document.getElementById("btnVoltar").onclick = () => {
    window.location.href = "/menu";
};

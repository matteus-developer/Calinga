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

console.log('=== Professor.js carregado ===');
console.log('É coordenador?', isCoordenador);

// =============================
// Salvar Professor
// =============================
function salvarProfessor() {
    console.log('Tentando salvar professor...');
    
    if (!isCoordenador) {
        alert("Você não tem permissão para cadastrar professores.");
        return;
    }
    
    if (
        !idNomeProfessor.value || 
        !idEmailProfessor.value || 
        !idSenhaProfessor.value || 
        !idMatriProfessor.value ||
        !idTipoProfessor.value
    ) {
        alert("Por favor, preencha todos os campos do professor.");
        return;
    }

    const tipo = parseInt(idTipoProfessor.value);

    if (tipo === 1) {
        // Coordenador - vincular a todas as disciplinas
        fetch("/disciplina/listar")
            .then(res => {
                if (!res.ok) throw new Error('Erro ao buscar disciplinas');
                return res.json();
            })
            .then(disciplinas => {
                const idsDisciplinas = disciplinas.map(d => d.idDisciplina);
                const professorDTO = {
                    nomeProfessor: idNomeProfessor.value,
                    emailProfessor: idEmailProfessor.value,
                    senhaProfessor: idSenhaProfessor.value,
                    matriProfessor: idMatriProfessor.value,
                    tipoProfessor: tipo,
                    idsDisciplinas: idsDisciplinas
                };
                enviarProfessor(professorDTO);
            })
            .catch(err => {
                console.error("Erro ao buscar disciplinas:", err);
                alert("Erro ao buscar disciplinas");
            });
    } else {
        // Professor comum - disciplinas selecionadas
        const checkboxes = document.querySelectorAll(".check-disciplina:checked");
        const disciplinasSelecionadas = [...checkboxes].map(c => parseInt(c.value));

        const professorDTO = {
            nomeProfessor: idNomeProfessor.value,
            emailProfessor: idEmailProfessor.value,
            senhaProfessor: idSenhaProfessor.value,
            matriProfessor: idMatriProfessor.value,
            tipoProfessor: tipo,
            idsDisciplinas: disciplinasSelecionadas
        };
        enviarProfessor(professorDTO);
    }
}

function enviarProfessor(professorDTO) {
    console.log('Enviando professor:', professorDTO);
    
    fetch("/professor/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(professorDTO)
    })
    .then(res => {
        console.log('Status resposta:', res.status);
        if (res.status === 403) {
            alert("Acesso Negado. Apenas coordenadores podem cadastrar professores.");
            return Promise.reject("Acesso negado");
        }
        if (!res.ok) throw new Error('Erro ao salvar');
        return res.json();
    })
    .then(() => {
        alert("Professor cadastrado com sucesso!");
        limparCamposProfessor();
        listarProfessores();
    })
    .catch(err => {
        console.error("Erro ao cadastrar:", err);
        if (err.message !== "Acesso negado") {
            alert("Erro ao cadastrar professor");
        }
    });
}

function limparCamposProfessor() {
    if (idNomeProfessor) idNomeProfessor.value = "";
    if (idEmailProfessor) idEmailProfessor.value = "";
    if (idSenhaProfessor) idSenhaProfessor.value = "";
    if (idMatriProfessor) idMatriProfessor.value = "";
    if (idTipoProfessor) idTipoProfessor.value = "";
}

// =============================
// Listar Disciplinas
// =============================
function listarDisciplinas() {
    console.log('Carregando disciplinas...');
    
    fetch("/disciplina/listar")
        .then(res => {
            console.log('Status disciplinas:', res.status);
            if (!res.ok) throw new Error('Erro ao buscar disciplinas');
            return res.json();
        })
        .then(disciplinas => {
            console.log('Disciplinas carregadas:', disciplinas.length);
            
            if (tabelaBody) {
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
            }
        })
        .catch(err => {
            console.error("Erro ao listar disciplinas:", err);
            alert("Erro ao carregar disciplinas");
        });
}

// =============================
// Listar Professores
// =============================
function listarProfessores() {
    console.log('👥 Carregando professores...');
    
    fetch("/professor/listar")
        .then(res => {
            console.log('Status professores:', res.status);
            
            if (res.status === 403) {
                const tbody = document.querySelector("#tableProfessor tbody");
                if (tbody) {
                    tbody.innerHTML = "<tr><td colspan='5'>Acesso restrito. Apenas Coordenadores podem listar todos os professores.</td></tr>";
                }
                return Promise.reject("Acesso negado");
            }
            if (!res.ok) throw new Error(`Erro: ${res.status}`);
            return res.json();
        })
        .then(professores => {
            console.log('Professores carregados:', professores.length);
            
            const tbody = document.querySelector("#tableProfessor tbody");
            if (!tbody) {
                console.error('Tabela de professores não encontrada');
                return;
            }
            
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
        })
        .catch(err => {
            if (err.message !== "Acesso negado") {
                console.error("Erro ao listar professores:", err);
            }
        });
}

// =============================
// Excluir Professor
// =============================
document.addEventListener("click", function (event) {
    if (!isCoordenador) return;

    if (event.target.classList.contains("btn-excluir")) {
        const idProfessor = event.target.getAttribute("data-id");

        const senha = prompt("Digite a senha para confirmar a exclusão:");
        if (!senha) {
            alert("Exclusão cancelada. Senha não informada.");
            return;
        }

        const senhaCorreta = "fatecGRU2025@#";
        if (senha !== senhaCorreta) {
            alert("Senha incorreta! Exclusão não autorizada.");
            return;
        }

        if (confirm("Tem certeza que deseja excluir este professor?")) {
            fetch(`/professor/excluir/${idProfessor}`, {
                method: "DELETE"
            })
            .then(res => {
                if (res.ok) {
                    alert("Professor excluído com sucesso!");
                    listarProfessores();
                } else if (res.status === 404) {
                    alert("Professor não encontrado!");
                } else if (res.status === 403) {
                    alert("Acesso Negado. Você não tem permissão para excluir.");
                } else {
                    alert("Erro ao excluir professor.");
                }
            })
            .catch(err => console.error("Erro ao excluir:", err));
        }
    }
});

// =============================
// Editar Professor
// =============================
document.addEventListener("click", function (event) {
    if (!isCoordenador) return;

    if (event.target.classList.contains("btn-editar")) {
        const idProfessor = event.target.getAttribute("data-id");

        fetch(`/professor/${idProfessor}`)
            .then(res => res.json())
            .then(professor => {
                document.querySelector("#editIdProfessor").value = professor.idProfessor;
                document.querySelector("#editNomeProfessor").value = professor.nomeProfessor;
                document.querySelector("#editEmailProfessor").value = professor.emailProfessor;
                document.querySelector("#editSenhaProfessor").value = professor.senhaProfessor;
                document.querySelector("#editMatriProfessor").value = professor.matriProfessor;
                document.querySelector("#editTipoProfessor").value = professor.tipoProfessor;

                fetch("/disciplina/listar")
                    .then(res => res.json())
                    .then(disciplinas => {
                        const container = document.querySelector("#editListaDisciplinas");
                        container.innerHTML = "";

                        disciplinas.forEach(d => {
                            const checked = professor.disciplinas.some(pd => pd.idDisciplina === d.idDisciplina);
                            const div = document.createElement("div");
                            div.innerHTML = `
                                <label>
                                    <input type="checkbox" class="edit-check-disciplina" value="${d.idDisciplina}" ${checked ? "checked" : ""}>
                                    ${d.nomeDisciplina}
                                </label>
                            `;
                            container.appendChild(div);
                        });

                        document.querySelector("#modalEditar").style.display = "flex";
                    });
            })
            .catch(err => console.error("Erro ao buscar professor:", err));
    }
});

// =============================
// Atualizar Professor
// =============================
const formEditarProfessor = document.querySelector("#formEditarProfessor");
if (formEditarProfessor) {
    formEditarProfessor.addEventListener("submit", function (event) {
        event.preventDefault();
        
        if (!isCoordenador) {
            alert("Você não tem permissão para atualizar dados de professores.");
            return;
        }
        
        const id = document.querySelector("#editIdProfessor").value;
        const idsDisciplinas = [...document.querySelectorAll(".edit-check-disciplina:checked")].map(c => parseInt(c.value));

        const dto = {
            nomeProfessor: document.querySelector("#editNomeProfessor").value,
            emailProfessor: document.querySelector("#editEmailProfessor").value,
            senhaProfessor: document.querySelector("#editSenhaProfessor").value,
            matriProfessor: document.querySelector("#editMatriProfessor").value,
            tipoProfessor: parseInt(document.querySelector("#editTipoProfessor").value),
            idsDisciplinas: idsDisciplinas
        };

        fetch(`/professor/atualizar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        })
        .then(res => {
            if (res.ok) {
                alert("Professor atualizado com sucesso!");
                document.querySelector("#modalEditar").style.display = "none";
                listarProfessores();
            } else if (res.status === 403) {
                alert("Acesso Negado. Você não tem permissão para editar este perfil.");
            } else {
                alert("Erro ao atualizar professor.");
            }
        })
        .catch(err => console.error("Erro:", err));
    });
}

// =============================
// Event Listeners
// =============================
if (formProfessor) {
    formProfessor.addEventListener('submit', function(event) {
        event.preventDefault();
        salvarProfessor(); 
    });
}

// =============================
// Botão Voltar - COM VERIFICAÇÃO
// =============================
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.onclick = () => {
        window.location.href = "/menu";
    };
} else {
    console.warn('Botão #btnVoltar não encontrado na página');
}

// =============================
// Inicialização quando DOM carregar
// =============================
document.addEventListener("DOMContentLoaded", () => {
    console.log('Inicializando página de professores...');
    listarDisciplinas(); 
    listarProfessores();
});

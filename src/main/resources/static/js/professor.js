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

console.log('===========================================');
console.log('=== Professor.js carregado ===');
console.log('👤 É coordenador?', isCoordenador);
console.log('🌐 URL atual:', window.location.href);
console.log('===========================================');

// =============================
// Listar Disciplinas - COM DEBUG COMPLETO
// =============================
async function listarDisciplinas() {
    console.log('');
    console.log('📚 ========== INICIANDO LISTAGEM DE DISCIPLINAS ==========');
    console.log('📍 URL da requisição: /disciplina/list');
    
    try {
        console.log('⏳ Fazendo requisição...');
        
        const response = await fetch("/disciplina/list", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        console.log('📥 Resposta recebida:');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
        console.log('   OK?', response.ok);
        console.log('   Headers:', [...response.headers.entries()]);
        
        // Lê o corpo da resposta como texto primeiro para ver o que veio
        const responseText = await response.text();
        console.log('📄 Corpo da resposta (texto):', responseText);
        
        if (!response.ok) {
            console.error('❌ Resposta não OK!');
            console.error('   Status:', response.status);
            console.error('   Corpo:', responseText);
            
            if (response.status === 403) {
                alert('Acesso negado: apenas coordenadores podem ver disciplinas');
            } else if (response.status === 401) {
                alert('Não autenticado: faça login novamente');
                window.location.href = '/tela/login';
            } else {
                alert('Erro ao carregar disciplinas (Status ' + response.status + ')');
            }
            return;
        }
        
        // Tenta parsear o JSON
        let disciplinas;
        try {
            disciplinas = JSON.parse(responseText);
            console.log('✅ JSON parseado com sucesso');
            console.log('📊 Quantidade de disciplinas:', disciplinas.length);
            console.log('📋 Disciplinas:', disciplinas);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
            console.error('   Texto recebido:', responseText);
            alert('Erro: servidor não retornou JSON válido');
            return;
        }
        
        // Renderizar na tabela
        if (tabelaBody) {
            tabelaBody.innerHTML = "";
            console.log('🎨 Renderizando disciplinas na tabela...');
            
            disciplinas.forEach((d, index) => {
                console.log(`   ${index + 1}. ID: ${d.idDisciplina}, Nome: ${d.nomeDisciplina}`);
                
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
            
            console.log('✅ Disciplinas renderizadas com sucesso!');
        } else {
            console.error('❌ Elemento #tableDisciplina tbody não encontrado no DOM');
        }
        
    } catch (error) {
        console.error('❌ ========== ERRO NA REQUISIÇÃO DE DISCIPLINAS ==========');
        console.error('Tipo do erro:', error.name);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        alert('Erro ao carregar disciplinas: ' + error.message);
    }
    
    console.log('========== FIM DA LISTAGEM DE DISCIPLINAS ==========');
    console.log('');
}

// =============================
// Listar Professores - COM DEBUG COMPLETO
// =============================
async function listarProfessores() {
    console.log('');
    console.log('👥 ========== INICIANDO LISTAGEM DE PROFESSORES ==========');
    console.log('📍 URL da requisição: /professor/list');
    
    try {
        console.log('⏳ Fazendo requisição...');
        
        const response = await fetch("/professor/list", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        console.log('📥 Resposta recebida:');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
        console.log('   OK?', response.ok);
        
        const responseText = await response.text();
        console.log('📄 Corpo da resposta (texto):', responseText);
        
        if (!response.ok) {
            console.error('❌ Resposta não OK!');
            
            const tbody = document.querySelector("#tableProfessor tbody");
            if (tbody) {
                if (response.status === 403) {
                    tbody.innerHTML = "<tr><td colspan='5'>Acesso restrito. Apenas Coordenadores podem listar todos os professores.</td></tr>";
                } else {
                    tbody.innerHTML = `<tr><td colspan='5'>Erro ao carregar (Status ${response.status})</td></tr>`;
                }
            }
            return;
        }
        
        let professores;
        try {
            professores = JSON.parse(responseText);
            console.log('✅ JSON parseado com sucesso');
            console.log('📊 Quantidade de professores:', professores.length);
            console.log('📋 Professores:', professores);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
            alert('Erro: servidor não retornou JSON válido');
            return;
        }
        
        const tbody = document.querySelector("#tableProfessor tbody");
        if (!tbody) {
            console.error('❌ Elemento #tableProfessor tbody não encontrado no DOM');
            return;
        }
        
        tbody.innerHTML = "";
        console.log('🎨 Renderizando professores na tabela...');
        
        professores.forEach((p, index) => {
            console.log(`   ${index + 1}. ID: ${p.idProfessor}, Nome: ${p.nomeProfessor}, Tipo: ${p.tipoProfessor}`);
            
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
        
        console.log('✅ Professores renderizados com sucesso!');
        
    } catch (error) {
        console.error('❌ ========== ERRO NA REQUISIÇÃO DE PROFESSORES ==========');
        console.error('Tipo do erro:', error.name);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        
        const tbody = document.querySelector("#tableProfessor tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan='5'>Erro de conexão: ${error.message}</td></tr>`;
        }
    }
    
    console.log('========== FIM DA LISTAGEM DE PROFESSORES ==========');
    console.log('');
}

// [RESTO DO CÓDIGO - Salvar, Editar, Excluir, etc.]
// (Mantém as outras funções do código anterior)

function salvarProfessor() {
    console.log('📝 Tentando salvar professor...');
    
    if (!isCoordenador) {
        alert("Você não tem permissão para cadastrar professores.");
        return;
    }
    
    if (!idNomeProfessor.value || !idEmailProfessor.value || !idSenhaProfessor.value || 
        !idMatriProfessor.value || !idTipoProfessor.value) {
        alert("Por favor, preencha todos os campos do professor.");
        return;
    }

    const tipo = parseInt(idTipoProfessor.value);

    if (tipo === 1) {
        fetch("/disciplina/list")
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
    console.log('📤 Enviando professor:', professorDTO);
    
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
// Event Listeners
// =============================
if (formProfessor) {
    formProfessor.addEventListener('submit', function(event) {
        event.preventDefault();
        salvarProfessor(); 
    });
}

const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.onclick = () => {
        console.log('🔙 Voltando ao menu...');
        window.location.href = "/menu";
    };
} else {
    console.warn('⚠️ Botão #btnVoltar não encontrado na página');
}

// =============================
// Inicialização
// =============================
document.addEventListener("DOMContentLoaded", () => {
    console.log('🚀 ========== INICIALIZANDO PÁGINA ==========');
    console.log('📍 Página atual:', window.location.pathname);
    console.log('👤 Coordenador?', isCoordenador);
    console.log('');
    
    listarDisciplinas(); 
    listarProfessores();
});

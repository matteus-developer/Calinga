package com.example.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.dto.ProfessorDTO;
import com.example.model.Disciplina;
import com.example.model.Professor;
import com.example.repository.DisciplinaRepository;
import com.example.repository.ProfessorRepository;

import jakarta.transaction.Transactional;

@Service
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Lista todos os Professores cadastrados
    public List<Professor> ListarTodos() {
        return professorRepository.findAll();
    }

    // Salvar novo professor + relacionamento
    @Transactional
    public Professor SalvarProfessor(ProfessorDTO dto) {

        if (professorRepository.existsByMatriProfessor(dto.getMatriProfessor())) {
            throw new RuntimeException("A matrícula " + dto.getMatriProfessor() + " já está cadastrada para outro professor/coordenador.");
        }
        
        Professor pro = new Professor();
        pro.setNomeProfessor(dto.getNomeProfessor());
        pro.setMatriProfessor(dto.getMatriProfessor());
        
        // Criptografa a senha antes de salvar
        String senhaCriptografada = passwordEncoder.encode(dto.getSenhaProfessor());
        pro.setSenhaProfessor(senhaCriptografada);
        
        pro.setEmailProfessor(dto.getEmailProfessor());
        pro.setTipoProfessor(dto.getTipoProfessor());
        
        // Salva professor primeiro
        pro = professorRepository.save(pro);

        // Depois associa disciplinas
        if (dto.getIdsDisciplinas() != null && !dto.getIdsDisciplinas().isEmpty()) {
            List<Disciplina> disciplinas = disciplinaRepository.findAllById(dto.getIdsDisciplinas());
            pro.setDisciplinas(disciplinas);
            pro = professorRepository.save(pro);
        }

        return pro;
    }
    
    // Exclui o professor pelo seu idProfessor
    @Transactional
    public void ExcluirProfessor(int idProfessor) {
        Professor professor = professorRepository.findById(idProfessor)
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        // Remove vínculos com disciplinas primeiro
        professor.getDisciplinas().clear();
        professorRepository.save(professor);

        // Exclui o Professor
        professorRepository.deleteById(idProfessor);
    }

    // Busca o professor pela sua matricula
    public Professor GetBymatriProfessor(String matriProfessor) {
        return professorRepository.findBymatriProfessor(matriProfessor);
    }
    
    // Busca o professor pelo seu id
    public Professor GetByidProfessor(int idProfessor) {
        return professorRepository.findByIdProfessor(idProfessor);
    }

    // Atualiza o professor pelo seu idProfessor
    @Transactional
    public java.util.Optional<Professor> AtualizarProfessor(int idProfessor, ProfessorDTO dto) {
        return professorRepository.findById(idProfessor)
                .map(pro -> {

                    String novaMatricula = dto.getMatriProfessor();
                    String matriculaAtual = pro.getMatriProfessor();    
                
                    if (!matriculaAtual.equals(novaMatricula)) {
                        
                        // Busca o professor com a nova matrícula
                        Professor professorComMesmaMatricula = professorRepository.findBymatriProfessor(novaMatricula);
                        
                        // Se for encontrado um professor E ele não for o professor atual (pelo ID), lança exceção.
                        if (professorComMesmaMatricula != null && professorComMesmaMatricula.getIdProfessor() != idProfessor) {
                             throw new RuntimeException("A matrícula " + novaMatricula + " já está cadastrada para outro professor/coordenador.");
                        }
                    }
                    ////////////////////////////////////////////////


                    
                    
                    pro.setNomeProfessor(dto.getNomeProfessor());
                    pro.setMatriProfessor(dto.getMatriProfessor());
                    pro.setEmailProfessor(dto.getEmailProfessor());
                    
                    // Criptografa a senha antes de atualizar
                    if (dto.getSenhaProfessor() != null && !dto.getSenhaProfessor().isBlank()) {
                            String senhaCriptografada = passwordEncoder.encode(dto.getSenhaProfessor());
                            pro.setSenhaProfessor(senhaCriptografada);
                    }
                    
                    
                    pro.setTipoProfessor(dto.getTipoProfessor());
                    
                    // Atualizar disciplinas 
                    List<Disciplina> disciplinas = dto.getIdsDisciplinas().stream()
                            .map(id -> disciplinaRepository.findById(id).orElse(null))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());

                    pro.setDisciplinas(disciplinas);

                    return professorRepository.save(pro);
                });
    }
    
    public Professor buscarPorEmailEMatricula(String email, String matricula) {
        Professor professorEmail = professorRepository.findByemailProfessor(email);
        if (professorEmail == null) {
            return null;
        }

        // verifica matrícula também
        if (!professorEmail.getMatriProfessor().equals(matricula)) {
            return null;
        }

        return professorEmail;
    }
    
    @Transactional
    public void atualizarSenha(int idProfessor, String novaSenha) {
        Professor professor = professorRepository.findById(idProfessor)
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        // Criptografa a nova senha antes de salvar
        String senhaCriptografada = passwordEncoder.encode(novaSenha);
        professor.setSenhaProfessor(senhaCriptografada);

        professorRepository.save(professor);
    }
    
}



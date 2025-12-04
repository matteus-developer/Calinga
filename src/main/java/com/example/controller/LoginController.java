package com.example.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.model.Disciplina;
import com.example.model.Professor;
import com.example.service.LoginService;
import org.springframework.ui.Model;
import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {
	
    @Autowired
    private LoginService loginService;
    
    // Verifica as credenciais do professor no banco de dados e ao realizar o login 
    // salva o professorLogado, idProfessor e idsDisciplinas na sessão
    @PostMapping("/login")
    public String login(@RequestParam String matriProfessor,
                        @RequestParam String senhaProfessor,
                        HttpSession session,
                        Model model) {
        
        System.out.println("=== LOGIN INICIADO ===");
        System.out.println("Matrícula: " + matriProfessor);
        
        Professor professor = loginService.autenticar(matriProfessor, senhaProfessor);
        
        if (professor == null) {
            System.out.println("Login falhou - credenciais inválidas");
            model.addAttribute("erro", "Matrícula ou senha inválidos!");
            return "htmlLogin/login";
        }
        
        // =====================================================
        // CRÍTICO: Salvar o objeto COMPLETO do professor
        // =====================================================
        session.setAttribute("professorLogado", professor);
        
        // Salva ID do professor na sessão (compatibilidade)
        session.setAttribute("idProfessor", professor.getIdProfessor());
        
        // Salva lista de IDs das disciplinas do professor
        List<Integer> idsDisciplinas = professor.getDisciplinas()
            .stream()
            .map(Disciplina::getIdDisciplina)
            .collect(Collectors.toList());
        session.setAttribute("idsDisciplinas", idsDisciplinas);
        
        // Salva tipo do professor na sessão (0 = Professor, 1 = Coordenador)
        session.setAttribute("tipoProfessor", professor.getTipoProfessor());
        
        // Define timeout da sessão (30 minutos)
        session.setMaxInactiveInterval(1800);
        
        System.out.println("Login bem-sucedido!");
        System.out.println("Professor: " + professor.getNomeProfessor());
        System.out.println("Tipo: " + professor.getTipoProfessor());
        System.out.println("Session ID: " + session.getId());
        System.out.println("professorLogado salvo: " + (session.getAttribute("professorLogado") != null));
        System.out.println("=====================");
        
        return "redirect:/menu";
    }
}

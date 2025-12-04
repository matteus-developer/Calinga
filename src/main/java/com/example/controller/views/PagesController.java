package com.example.controller.views;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpSession;
import org.springframework.ui.Model;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Controller
public class PagesController {

    // Direciona para primeira tela do site (root)
    @GetMapping("/")
    public String home() {
        return "redirect:/tela/login";
    }

    @RequestMapping("/tela")
    public String telaRoot() {
        return "redirect:/tela/login";
    }

    // Outras rotas com /tela/...
    @GetMapping("/tela/disciplina")
    public String mostrarTelaDisciplina() {
        return "htmlDisciplina/disciplina"; 
    }

    @GetMapping("/tela/professor")
    public String mostrarTelaProfessor() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    boolean isCoordenador = auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_COORDENADOR"));

    model.addAttribute("isCoordenador", isCoordenador);
        return "htmlProfessor/professor"; 
    }

    @GetMapping("/tela/login")
    public String mostrarTelaLogin() {
        return "htmlLogin/login"; 
    }

    @GetMapping("/tela/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/tela/login";
    }

    @GetMapping("/tela/cadastrar/questao")
    public String mostrarTelaQuestao() {
        return "htmlQuestao/questao"; 
    }

    @GetMapping("/tela/gerenciar/questao")
    public String mostrarTelaGerenciarQuestao() {
        return "htmlQuestao/gerenciarquestao"; 
    }

    @GetMapping("/tela/prova")
    public String mostrarTelaProva() {
        return "htmlGerarProva/gerarProva"; 
    }  
  //Direciona para tela de acesso negado
  		@GetMapping("/tela/acesso-negado")
  		public String mostrarTelaAcessoNegado() {
  		    return "htmlAcessoNegado/acesso-negado";
  		}
}

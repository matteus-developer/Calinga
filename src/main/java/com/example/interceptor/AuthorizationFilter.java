package com.example.filter;

import com.example.model.Professor; // Assumindo que seu modelo Professor está aqui
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class AuthorizationFilter implements Filter {

    // Lista das rotas exclusivas do Coordenador (ex: Gerenciar Professores)
    private static final List<String> COORDINATOR_ROUTES = Arrays.asList(
        "/tela/professor",       // Assumindo que gerenciar professores está nesta rota
        "/tela/disciplina"     // Se tiver uma tela específica de dashboard do coordenador
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
        throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String uri = req.getRequestURI();
        
        // Se a URI não for uma rota de Coordenador, continua o processamento
        if (COORDINATOR_ROUTES.stream().noneMatch(uri::startsWith)) {
            chain.doFilter(request, response);
            return;
        }

        // --- Checagem de Autorização para Rotas Restritas ---
        HttpSession session = req.getSession(false);
        Professor professorLogado = (Professor) session.getAttribute("professorLogado"); 

        // O SessionFilter garante que professorLogado não é nulo.
        // Se o professor NÃO for Coordenador, bloqueia.
        if (professorLogado != null && !professorLogado.isCoordenador()) {
            
            // É CRUCIAL REDIRECIONAR PARA UMA PÁGINA QUE O PROFESSOR TEM ACESSO
            // NUNCA REDIRECIONE PARA UMA PÁGINA DE ERRO SE VOCÊ QUER EVITAR BYPASS DE URL.
            System.out.println("BLOQUEIO DE AUTORIZAÇÃO: Professor tentou acessar rota restrita. URI: " + uri);
            
            // Redireciona para a página inicial segura do Professor
            res.sendRedirect(req.getContextPath() + "/tela/menu"); // Redireciona para a tela inicial do Professor
            return; // Interrompe o processamento
        }

        // Se o professor for o Coordenador ou tiver permissão, continua
        chain.doFilter(request, response);
    }
}

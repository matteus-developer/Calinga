package com.example.filter; // Você pode colocar em um novo pacote 'filter'

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class SessionFilter implements Filter {

    // Define rotas que NÃO precisam de autenticação
    private static final List<String> publicRoutes = Arrays.asList(
        "/", 
        "/tela/login", 
        "/login", // Necessário para o POST do formulário
        "/tela/acesso-negado",
        "/tela/recuperarSenha",
        "/tela/nova-senha"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
        throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String uri = req.getRequestURI();
        HttpSession session = req.getSession(false);
        
        // 1. Permite acesso a recursos estáticos (CSS, JS, etc.)
        if (uri.startsWith("/css/") || uri.startsWith("/js/") || uri.startsWith("/images/")) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Permite acesso a rotas públicas
        if (publicRoutes.contains(uri)) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Verifica a autenticação para rotas protegidas
        if (session == null || session.getAttribute("idProfessor") == null) {
            // Se não logado, redireciona para a URL de login correta
            res.sendRedirect(req.getContextPath() + "/tela/login");
            return;
        }

        // Se autenticado, continua
        chain.doFilter(request, response);
    }
}

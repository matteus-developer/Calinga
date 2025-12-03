package com.example.filter;

import com.example.model.Professor;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

// Importante: Transformar em um componente para que o Spring Security possa injetar
@Component
public class AuthorizationFilter extends GenericFilter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpSession session = req.getSession(false);

        // 1. Tenta recuperar o professor logado da sessão
        Professor professorLogado = (Professor) (session != null ? session.getAttribute("professorLogado") : null);

        // 2. Se o professor estiver logado na sessão, autentica no Spring Security
        if (professorLogado != null) {
            // Define o TipoProfessor como a Role (Ex: "COORDENADOR" ou "PROFESSOR")
            String tipo = professorLogado.getTipoProfessor().toUpperCase(); 
            
            // CONVENÇÃO DO SPRING SECURITY: A Role deve ter o prefixo "ROLE_"
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + tipo)
            );

            // Cria o objeto de autenticação do Spring Security
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                professorLogado.getEmailProfessor(), // Principal (Email ou Matrícula)
                null, 
                authorities // Autoridades (Roles)
            );

            // Coloca a autenticação no contexto de segurança para que o SecurityConfig use hasRole()
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Continua o processamento da cadeia de filtros
        chain.doFilter(request, response);
    }
}

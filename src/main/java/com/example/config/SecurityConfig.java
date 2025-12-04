package com.example.config;

import com.example.filter.AuthorizationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private AuthorizationFilter authorizationFilter;

    // Você precisará registrar o SessionFilter em WebConfig ou através de FilterRegistrationBean.
    // O foco aqui é o Spring Security.
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desabilita CSRF (necessário para APIs e facilita testes)
            .csrf(csrf -> csrf.disable())
            
            // ----------------------------------------------------------------------------------
            // 1. REGRAS DE AUTORIZAÇÃO: Onde definimos quem acessa o quê.
            // ----------------------------------------------------------------------------------
            .authorizeHttpRequests(authorize -> authorize
                
                // Rotas Públicas (Login, Home, Recursos Estáticos)
                .requestMatchers(
                    "/", 
                    "/tela/login", 
                    "/login", // Assumindo que o POST de login é público
                    "/tela/acesso-negado",
                    "/css/**", // Permite acesso a recursos estáticos
                    "/js/**",
                    "/images/**"
                ).permitAll()

                // Rotas RESTRITAS AO COORDENADOR (URLs de API)
                // Usamos .hasRole() e o nome da Role SEM o prefixo "ROLE_"
                .requestMatchers(HttpMethod.POST, "/professor/salvar").hasRole("COORDENADOR")
                .requestMatchers(HttpMethod.PUT, "/professor/atualizar/**").hasRole("COORDENADOR")
                .requestMatchers(HttpMethod.DELETE, "/professor/excluir/**").hasRole("COORDENADOR")
                
                // Rotas restritas do Coordenador (Telas da UI, conforme seu filtro original)
                // Se houver alguma tela específica que o professor não pode ver.
                .requestMatchers("/tela/professor", "/tela/disciplina").hasRole("COORDENADOR")


                // QUALQUER OUTRA ROTA: Exige que o usuário esteja autenticado (logado)
                .anyRequest().authenticated()
            )
            
            // ----------------------------------------------------------------------------------
            // 2. INTEGRAÇÃO COM SEU FILTRO DE SESSÃO
            // ----------------------------------------------------------------------------------
            // Adiciona o filtro customizado (AuthorizationFilter) para ler a sessão e autenticar
            // o usuário no contexto do Spring Security ANTES que as regras acima sejam checadas.
            .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // 3. CONFIGURAÇÃO DE ERRO DE ACESSO NEGADO
            // O Spring Security tratará o acesso negado para URLs REST e UI.
            .exceptionHandling(exceptions -> exceptions
                .accessDeniedPage("/tela/acesso-negado") // Redireciona para sua página customizada em caso de 403 Forbidden
                .authenticationEntryPoint((request, response, authException) -> {
                    // Para requisições de API, retorna 401 Unauthorized
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Acesso não autorizado ou sessão expirada.");
                })
            );
            
        // Não precisamos desabilitar formLogin e httpBasic, pois a configuração customizada os sobrescreve.
        
        return http.build();
    }
}

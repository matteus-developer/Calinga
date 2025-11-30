package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import com.example.filter.SessionFilter; // Importe o novo Filter

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // REMOVA o Autowired e o método addInterceptors do AuthInterceptor

    @Bean
    public FilterRegistrationBean<SessionFilter> sessionFilterRegistration() {
        FilterRegistrationBean<SessionFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SessionFilter());
        
        // Aplica o filtro a todas as rotas (/**)
        registration.addUrlPatterns("/*"); 
        
        // Garante que o filtro é executado logo no início (ordem 1)
        registration.setOrder(1); 
        return registration;
    }

     @Bean
    public FilterRegistrationBean<SessionFilter> sessionFilterRegistration() {
        FilterRegistrationBean<SessionFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SessionFilter());
        registration.addUrlPatterns("/*");
        
        // Ordem 1: Autenticação (deve vir primeiro)
        registration.setOrder(1); 
        return registration;
    }

    @Bean
    public FilterRegistrationBean<AuthorizationFilter> authorizationFilterRegistration() {
        FilterRegistrationBean<AuthorizationFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new AuthorizationFilter());
        registration.addUrlPatterns("/*");
        
        // Ordem 2: Autorização (deve vir depois da autenticação)
        registration.setOrder(2); 
        return registration;
    }
}

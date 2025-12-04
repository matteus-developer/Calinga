package com.example.model;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "professor") // <-- IMPORTANTE
public class Professor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProfessor") // coluna do Railway
    private int idProfessor;

    @Column(name = "nomeProfessor") // <-- obrigatório no Railway
    private String nomeProfessor;

    @Column(name = "matriProfessor")
    private String matriProfessor;

    @Column(name = "emailProfessor")
    private String emailProfessor;

    @Column(name = "senhaProfessor")
    private String senhaProfessor;

    @Column(name = "tipoProfessor")
    private byte tipoProfessor;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "professordisciplina", 
        joinColumns = @JoinColumn(name = "idProfessor"), 
        inverseJoinColumns = @JoinColumn(name = "idDisciplina")
    )
    @JsonIgnoreProperties("professores")
    private List<Disciplina> disciplinas = new ArrayList<>();

    public Professor() {}

    public Professor(int idProfessor, String nomeProfessor, String matriProfessor, 
                     String emailProfessor, String senhaProfessor, byte tipoProfessor) {
        this.idProfessor = idProfessor;
        this.nomeProfessor = nomeProfessor;
        this.matriProfessor = matriProfessor;
        this.emailProfessor = emailProfessor;
        this.senhaProfessor = senhaProfessor;
        this.tipoProfessor = tipoProfessor;
    }
    
    public int getIdProfessor() {
        return idProfessor;
    }

    public String getNomeProfessor() {
        return nomeProfessor;
    }

    public void setNomeProfessor(String nomeProfessor) {
        this.nomeProfessor = nomeProfessor;
    }

    public String getMatriProfessor() {
        return matriProfessor;
    }

    public void setMatriProfessor(String matriProfessor) {
        this.matriProfessor = matriProfessor;
    }

    public String getEmailProfessor() {
        return emailProfessor;
    }

    public void setEmailProfessor(String emailProfessor) {
        this.emailProfessor = emailProfessor;
    }

    public String getSenhaProfessor() {
        return senhaProfessor;
    }

    public void setSenhaProfessor(String senhaProfessor) {
        this.senhaProfessor = senhaProfessor;
    }

    public byte getTipoProfessor() {
        return tipoProfessor;
    }

    public void setTipoProfessor(byte tipoProfessor) {
        this.tipoProfessor = tipoProfessor;
    }

    public List<Disciplina> getDisciplinas() {
        return disciplinas;
    }

    public void setDisciplinas(List<Disciplina> disciplinas) {
        this.disciplinas = disciplinas;
    }

    /**
     * Verifica se o professor é um Coordenador.
     */
    public boolean isCoordenador() {
        return this.tipoProfessor == 1; 
    }
}

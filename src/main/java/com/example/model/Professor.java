package com.example.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;

@Entity
public class Professor {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProfessor") // informa o nome real da coluna
    private int idProfessor;

    private String nomeProfessor;
    private String matriProfessor;
    private String emailProfessor;
    private String senhaProfessor;

    @Column(name = "tipoProfessor", columnDefinition = "TINYINT")
    private byte tipoProfessor; // 0, 1, 2, etc.

    //@ManyToMany
    //@JoinTable(
   //     name = "professordisciplina", // nome da tabela intermediária
    //    joinColumns = @JoinColumn(name = "idProfessor"), // FK do professor
     //   inverseJoinColumns = @JoinColumn(name = "idDisciplina") // FK da disciplina
    //)
    //private List<Disciplina> disciplinas = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER) // ADICIONE FETCHTYPE.EAGER
    @JoinTable(
    name = "professordisciplina", 
    joinColumns = @JoinColumn(name = "idProfessor"), 
    inverseJoinColumns = @JoinColumn(name = "idDisciplina") 
)
private List<Disciplina> disciplinas = new ArrayList<>();

    public Professor() {
        super();
    }

    public Professor(int idProfessor, String nomeProfessor, String matriProfessor, String emailProfessor,
                     String senhaProfessor, byte tipoProfessor) {
        super();
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
}


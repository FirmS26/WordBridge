package wordbridge.frontend.models;

import jakarta.persistence.*;
@Entity
@Table(name = "answers")
public class Answer_old {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;


private int number;
private String input;
// Getters and Setters
}

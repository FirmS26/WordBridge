package wordbridge.frontend;

import jakarta.persistence.*;
@Entity
@Table(name = "answers")
public class Answer {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;


private int number;
private String input;
// Getters and Setters
}

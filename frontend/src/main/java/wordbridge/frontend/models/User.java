package wordbridge.frontend.models;

import java.time.LocalDateTime;

import jakarta.persistence.Id;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;





@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password; //add constraints later, eg needs numbers capitalization special characters etc

    @NotBlank
    private String firstName; //maybe add constraints? length, no special characters, etc

    @NotBlank
    private String lastName; //maybe add constraints (same as firstname)

    private LocalDateTime regDateAndTime;

    //make sure this works with the details request dto and account creation service:
    //private LocalDateTime lastLoginDateTime;

    //also track lesson progress. most recent lesson, score, words for review, etc


}
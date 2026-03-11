package wordbridge.frontend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// UserRegistrationDTO.java

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationDto {



    @Email(message = "Email is not in valid format!")
    @NotBlank(message = "Email is required!")
    private String email;

    //add password messages

    //add name messages (if we include name validation)
}

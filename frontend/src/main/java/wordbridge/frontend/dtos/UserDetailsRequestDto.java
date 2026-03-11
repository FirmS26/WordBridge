package wordbridge.frontend.dtos;

import java.time.LocalDateTime;

public class UserDetailsRequestDto {

    private Long id;
    private String email;
    private String password; 
    private String firstName; 
    private String lastName; 
    private LocalDateTime regDateAndTime;
    //private LocalDateTime lastLoginDateTime;


    //add getters and setters.
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email ) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public LocalDateTime setRegDateAndTime(){return regDateAndTime;}
    public void setRegDateAndTime(LocalDateTime regDateAndTime) { this.regDateAndTime = regDateAndTime;}
    

}

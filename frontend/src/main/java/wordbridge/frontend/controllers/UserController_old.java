package wordbridge.frontend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import wordbridge.frontend.models.User_old;
import wordbridge.frontend.repositories.UserRepository_old;

import java.util.List;
@RestController
@RequestMapping("/users")
public class UserController_old {
@Autowired
private UserRepository_old userRepository;
@PostMapping
public User_old createUser(@RequestBody User_old user) {
return userRepository.save(user);
}
@GetMapping
public List<User_old> getUsers() {
return userRepository.findAll();
}
}
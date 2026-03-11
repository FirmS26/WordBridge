package wordbridge.frontend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import wordbridge.frontend.models.User_old;
public interface UserRepository_old extends JpaRepository<User_old, Long> {
}
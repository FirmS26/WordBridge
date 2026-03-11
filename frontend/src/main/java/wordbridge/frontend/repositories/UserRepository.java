package wordbridge.frontend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

import wordbridge.frontend.models.User;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Developers can define methods in repository interfaces with custom query keywords,
    // and Spring Data JPA automatically translates them into appropriate SQL queries.
    User findByEmail(String email);

    User findByUsername(String userName);

    List<User> findAllByOrderByRegDateTimeDesc();

}


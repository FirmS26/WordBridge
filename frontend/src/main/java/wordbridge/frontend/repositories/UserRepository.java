package wordbridge.frontend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

import wordbridge.frontend.models.Users;


@Repository
public interface UserRepository extends JpaRepository<Users, Integer> {

    // Developers can define methods in repository interfaces with custom query keywords,
    // and Spring Data JPA automatically translates them into appropriate SQL queries.
    Users findByEmail(String email);

    //User findByUsername(String userName);

    List<Users> findAllByOrderByRegDateAndTimeDesc();

}


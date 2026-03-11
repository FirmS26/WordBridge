package wordbridge.frontend.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import wordbridge.frontend.dtos.ApiResponseDto;
import wordbridge.frontend.dtos.ApiResponseStatus;
import wordbridge.frontend.dtos.UserDetailsRequestDto;
import wordbridge.frontend.dtos.UserRegistrationDto;
import wordbridge.frontend.exceptions.UserServiceLogicException;
import wordbridge.frontend.models.User;
import wordbridge.frontend.exceptions.UserAlreadyExistsException;
import wordbridge.frontend.exceptions.UserNotFoundException;
import wordbridge.frontend.repositories.UserRepository;

@Component
@Slf4j
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepository userRepository;

@Override //logic to create new user
    public ResponseEntity<ApiResponseDto<?>> registerUser(UserDetailsRequestDto newUserDetails)
            throws UserAlreadyExistsException, UserServiceLogicException {
                
        try {
            if (userRepository.findByEmail(newUserDetails.getEmail()) != null){
                throw new UserAlreadyExistsException("Registration failed: User already exists with email " + newUserDetails.getEmail());
            }


            User newUser = new User(
                    null, newUserDetails.getFirstName(), newUserDetails.getLastName(), newUserDetails.getPassword(), newUserDetails.getEmail(), LocalDateTime.now()
            );

            // save() is an in built method given by JpaRepository
            userRepository.save(newUser);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ApiResponseDto<>(ApiResponseStatus.SUCCESS.name(), "New user account has been successfully created!"));

        }catch (UserAlreadyExistsException e) {
            throw new UserAlreadyExistsException(e.getMessage());
        }catch (Exception e) {
            log.error("Failed to create new user account: " + e.getMessage());
            throw new UserServiceLogicException();
        }
    }







@Override //logic to get all users
    public ResponseEntity<ApiResponseDto<?>> getAllUsers() throws UserServiceLogicException {
        try {
            List<User> users = userRepository.findAllByOrderByRegDateTimeDesc();

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(new ApiResponseDto<>(ApiResponseStatus.SUCCESS.name(), users)
                    );

        }catch (Exception e) {
            log.error("Failed to fetch all users: " + e.getMessage());
            throw new UserServiceLogicException();
        }
    }




@Override //logic to update user
    public ResponseEntity<ApiResponseDto<?>> updateUser(UserDetailsRequestDto newUserDetails, int id)
            throws UserNotFoundException, UserServiceLogicException {
        try {
            User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found with id " + id));

            //updates everything for now but this should be broken up into multiple
            //eg users can update their email or username or password but not all at once
            //also similar logic to update most recent login once that's implemented
            user.setEmail(newUserDetails.getEmail());
            user.setFirstName(newUserDetails.getFirstName());
            user.setLastName(newUserDetails.getLastName());
            user.setPassword(newUserDetails.getPassword());
            

            userRepository.save(user);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(new ApiResponseDto<>(ApiResponseStatus.SUCCESS.name(), "User account updated successfully!")
                    );

        }catch(UserNotFoundException e){
            throw new UserNotFoundException(e.getMessage());
        }catch(Exception e) {
            log.error("Failed to update user account: " + e.getMessage());
            throw new UserServiceLogicException();
        }
    }




    @Override //logic to delete user
    public ResponseEntity<ApiResponseDto<?>> deleteUser(int id) throws UserServiceLogicException, UserNotFoundException {
        try {
            User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found with id " + id));

            userRepository.delete(user);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(new ApiResponseDto<>(ApiResponseStatus.SUCCESS.name(), "User account deleted successfully!")
                    );
        } catch (UserNotFoundException e) {
            throw new UserNotFoundException(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to delete user account: " + e.getMessage());
            throw new UserServiceLogicException();
        }
    }


}
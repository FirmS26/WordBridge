package wordbridge.frontend.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import wordbridge.frontend.dtos.ApiResponseDto;
import wordbridge.frontend.dtos.UserDetailsRequestDto;
import wordbridge.frontend.dtos.UserRegistrationDto;
import wordbridge.frontend.exceptions.UserServiceLogicException;
import wordbridge.frontend.exceptions.UserAlreadyExistsException;
import wordbridge.frontend.exceptions.UserNotFoundException;

@Service
public interface UserService {

    ResponseEntity<ApiResponseDto<?>> registerUser(UserDetailsRequestDto newUserDetails)
            throws UserAlreadyExistsException, UserServiceLogicException;

    ResponseEntity<ApiResponseDto<?>> getAllUsers() 
            throws UserServiceLogicException;

    ResponseEntity<ApiResponseDto<?>> updateUser(UserDetailsRequestDto newUserDetails, int id) 
            throws UserNotFoundException, UserServiceLogicException;

    ResponseEntity<ApiResponseDto<?>> deleteUser(int id) 
            throws UserServiceLogicException, UserNotFoundException;
    
}
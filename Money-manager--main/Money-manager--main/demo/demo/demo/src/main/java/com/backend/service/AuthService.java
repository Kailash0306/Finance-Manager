package com.backend.service;

import com.backend.dto.AuthResponse;
import com.backend.dto.LoginRequest;
import com.backend.dto.RegisterRequest;
import com.backend.dto.UserResponse;
import com.backend.model.User;
import com.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** In-memory token store: token -> userId (for session validation) */
    private final Map<String, String> tokenStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName() != null ? request.getName().trim() : "");
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, user.getId());
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, user.getId());
        return new AuthResponse(token, toUserResponse(user));
    }

    public UserResponse validateToken(String token) {
        if (token == null || token.isBlank()) return null;
        String userId = tokenStore.get(token);
        if (userId == null) return null;
        return userRepository.findById(userId)
                .map(AuthService::toUserResponse)
                .orElse(null);
    }

    public void logout(String token) {
        if (token != null) tokenStore.remove(token);
    }

    private static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName());
    }
}

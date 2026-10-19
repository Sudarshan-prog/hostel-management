package com.hostel.management.controller;

import com.hostel.management.dto.LoginRequest;
import com.hostel.management.dto.LoginResponse;
import com.hostel.management.model.Student;
import com.hostel.management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Student> student = studentRepository.findByEmailAndPassword(request.getEmail(), request.getPassword());
        if (student.isPresent()) {
            LoginResponse response = new LoginResponse();
            response.setId(student.get().getId());
            response.setName(student.get().getName());
            response.setEmail(student.get().getEmail());
            response.setRole(student.get().getRole());
            response.setYearOfStudy(student.get().getYearOfStudy());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Invalid email or password");
    }

    @PostMapping("/sso-login")
    public ResponseEntity<?> ssoLogin(@RequestBody LoginRequest request) {
        String email = request.getEmail();
        if (email == null || !email.endsWith("@kgkite.ac.in")) {
            return ResponseEntity.status(401).body("Please use your official @kgkite.ac.in college email.");
        }

        Optional<Student> student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            LoginResponse response = new LoginResponse();
            response.setId(student.get().getId());
            response.setName(student.get().getName());
            response.setEmail(student.get().getEmail());
            response.setRole(student.get().getRole());
            response.setYearOfStudy(student.get().getYearOfStudy());
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(403).body("Access Denied: Your email is not in the admitted students list. Please contact administration.");
    }
}

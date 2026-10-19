package com.hostel.management.controller;

import com.hostel.management.dto.StudentDTO;
import com.hostel.management.model.Student;
import com.hostel.management.repository.StudentRepository;
import com.hostel.management.service.AcademicYearRolloverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AcademicYearRolloverService rolloverService;

    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setYearOfStudy(student.getYearOfStudy());
        return dto;
    }

    @GetMapping
    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .filter(s -> "STUDENT".equals(s.getRole()))
                .map(s -> ResponseEntity.ok(toDTO(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadStudents(@RequestBody List<Student> students) {
        for (Student s : students) {
            if (studentRepository.findByEmail(s.getEmail()).isEmpty()) {
                s.setRole("STUDENT");
                s.setPassword("SSO_LOGIN_ONLY");
                s.setYearOfStudy(1);
                studentRepository.save(s);
            }
        }
        return ResponseEntity.ok("Students uploaded successfully");
    }

    @PostMapping("/rollover")
    public ResponseEntity<?> academicYearRollover() {
        rolloverService.performRollover();
        return ResponseEntity.ok("Academic Year Rollover completed successfully");
    }
}

package com.hostel.management.controller;

import com.hostel.management.model.Complaint;
import com.hostel.management.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping
    public List<Complaint> getAll() {
        return complaintRepository.findAll();
    }

    @PostMapping
    public Complaint create(@RequestBody Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Complaint> resolveComplaint(@PathVariable Long id) {
        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus("resolved");
            return ResponseEntity.ok(complaintRepository.save(complaint));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (complaintRepository.existsById(id)) {
            complaintRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

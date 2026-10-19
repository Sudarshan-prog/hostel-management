package com.hostel.management.service;

import com.hostel.management.model.Bed;
import com.hostel.management.model.Student;
import com.hostel.management.repository.BedRepository;
import com.hostel.management.repository.ComplaintRepository;
import com.hostel.management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AcademicYearRolloverService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Transactional
    public void performRollover() {
        List<Bed> allBeds = bedRepository.findAll();
        for (Bed bed : allBeds) {
            if (bed.getBookedBy() != null) {
                bed.setBookedBy(null);
                bed.setStatus("available");
                bedRepository.save(bed);
            }
        }

        complaintRepository.deleteAll();

        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            if ("ADMIN".equals(student.getRole())) continue;

            if (student.getYearOfStudy() != null && student.getYearOfStudy() == 4) {
                studentRepository.delete(student);
            } else if (student.getYearOfStudy() != null && student.getYearOfStudy() < 4) {
                student.setYearOfStudy(student.getYearOfStudy() + 1);
                studentRepository.save(student);
            } else {
                student.setYearOfStudy(1);
                studentRepository.save(student);
            }
        }
    }
}

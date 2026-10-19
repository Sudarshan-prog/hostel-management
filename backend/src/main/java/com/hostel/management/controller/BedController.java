package com.hostel.management.controller;

import com.hostel.management.dto.BedDTO;
import com.hostel.management.model.Bed;
import com.hostel.management.model.Room;
import com.hostel.management.model.Student;
import com.hostel.management.repository.BedRepository;
import com.hostel.management.repository.RoomRepository;
import com.hostel.management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private StudentRepository studentRepository;

    private BedDTO toDTO(Bed bed) {
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setIdentifier(bed.getIdentifier());
        dto.setStatus(bed.getStatus());
        dto.setRoomId(bed.getRoom().getId());
        if (bed.getBookedBy() != null) {
            dto.setBookedByStudentId(bed.getBookedBy().getId());
            dto.setBookedByStudentName(bed.getBookedBy().getName());
        }
        return dto;
    }

    @GetMapping
    public List<BedDTO> getAll(@RequestParam(required = false) Integer yearOfStudy) {
        if (yearOfStudy != null) {
            return bedRepository.findByFloorTargetYear(yearOfStudy).stream()
                    .map(this::toDTO).collect(Collectors.toList());
        }
        return bedRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/year/{year}")
    public List<BedDTO> getByYear(@PathVariable Integer year) {
        return bedRepository.findByFloorTargetYear(year).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/room/{roomId}")
    public List<BedDTO> getByRoom(@PathVariable Long roomId) {
        return bedRepository.findByRoomId(roomId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/student/{studentId}")
    public List<BedDTO> getByStudent(@PathVariable Long studentId) {
        return bedRepository.findByBookedById(studentId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BedDTO dto) {
        return roomRepository.findById(dto.getRoomId()).map(room -> {
            Bed bed = new Bed();
            bed.setIdentifier(dto.getIdentifier());
            bed.setStatus("available");
            bed.setRoom(room);
            return ResponseEntity.ok(toDTO(bedRepository.save(bed)));
        }).orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{bedId}/book/{studentId}")
    public ResponseEntity<?> bookBed(@PathVariable Long bedId, @PathVariable Long studentId) {
        Bed bed = bedRepository.findById(bedId).orElse(null);
        Student student = studentRepository.findById(studentId).orElse(null);

        if (bed == null || student == null) {
            return ResponseEntity.notFound().build();
        }
        if ("booked".equals(bed.getStatus())) {
            return ResponseEntity.badRequest().body("Bed is already booked");
        }

        // Validate floor target year matches student year
        if (bed.getRoom() != null && bed.getRoom().getFloor() != null) {
            Integer targetYear = bed.getRoom().getFloor().getTargetYear();
            Integer studentYear = student.getYearOfStudy();
            if (targetYear != null && studentYear != null && !targetYear.equals(studentYear)) {
                return ResponseEntity.status(403).body("You can only book beds on the floor assigned to your year of study (Year " + studentYear + ").");
            }
        }

        bed.setStatus("booked");
        bed.setBookedBy(student);
        return ResponseEntity.ok(toDTO(bedRepository.save(bed)));
    }

    @PostMapping("/{bedId}/unbook")
    public ResponseEntity<?> unbookBed(@PathVariable Long bedId) {
        return bedRepository.findById(bedId).map(bed -> {
            bed.setStatus("available");
            bed.setBookedBy(null);
            return ResponseEntity.ok(toDTO(bedRepository.save(bed)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (bedRepository.existsById(id)) {
            bedRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

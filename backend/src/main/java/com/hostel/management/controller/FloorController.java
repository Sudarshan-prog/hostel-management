package com.hostel.management.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hostel.management.dto.FloorDTO;
import com.hostel.management.model.Building;
import com.hostel.management.model.Floor;
import com.hostel.management.repository.BuildingRepository;
import com.hostel.management.repository.FloorRepository;
import com.hostel.management.repository.RoomRepository;
import com.hostel.management.repository.BedRepository;
import com.hostel.management.model.Room;
import com.hostel.management.model.Bed;

@RestController
@RequestMapping("/api/floors")
public class FloorController {

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    private ResponseEntity<String> validateTargetYear(Integer targetYear) {
        if (targetYear == null || targetYear < 1 || targetYear > 4) {
            return ResponseEntity.badRequest().body("Target year is required and must be between 1 and 4.");
        }
        return null;
    }

    private FloorDTO toDTO(Floor floor) {
        FloorDTO dto = new FloorDTO();
        dto.setId(floor.getId());
        dto.setName(floor.getName());
        dto.setBuildingId(floor.getBuilding().getId());
        dto.setBuildingName(floor.getBuilding().getName());
        dto.setTargetYear(floor.getTargetYear());
        return dto;
    }

    @GetMapping
    public List<FloorDTO> getAll() {
        return floorRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/building/{buildingId}")
    public List<FloorDTO> getByBuilding(@PathVariable Long buildingId) {
        return floorRepository.findByBuildingId(buildingId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FloorDTO dto) {
        ResponseEntity<String> validation = validateTargetYear(dto.getTargetYear());
        if (validation != null) return validation;

        return buildingRepository.findById(dto.getBuildingId()).map(building -> {
            Floor floor = new Floor();
            floor.setName(dto.getName());
            floor.setBuilding(building);
            floor.setTargetYear(dto.getTargetYear());
            return ResponseEntity.ok(toDTO(floorRepository.save(floor)));
        }).orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FloorDTO dto) {
        ResponseEntity<String> validation = validateTargetYear(dto.getTargetYear());
        if (validation != null) return validation;

        return floorRepository.findById(id).map(floor -> {
            floor.setName(dto.getName());
            floor.setTargetYear(dto.getTargetYear());
            if (dto.getBuildingId() != null) {
                Building building = buildingRepository.findById(dto.getBuildingId()).orElse(null);
                if (building != null) floor.setBuilding(building);
            }
            return ResponseEntity.ok(toDTO(floorRepository.save(floor)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (floorRepository.existsById(id)) {
                // Cascade delete rooms and beds
                List<Room> rooms = roomRepository.findByFloorId(id);
                for (Room room : rooms) {
                    List<Bed> beds = bedRepository.findByRoomId(room.getId());
                    for (Bed bed : beds) {
                        bedRepository.deleteById(bed.getId());
                    }
                    roomRepository.deleteById(room.getId());
                }

                floorRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Cannot delete this floor. It is being referenced elsewhere.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting floor: " + e.getMessage());
        }
    }
}

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

import com.hostel.management.dto.RoomDTO;
import com.hostel.management.model.Floor;
import com.hostel.management.model.Room;
import com.hostel.management.repository.FloorRepository;
import com.hostel.management.repository.RoomRepository;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private com.hostel.management.repository.BedRepository bedRepository;

    private RoomDTO toDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setType(room.getType());
        dto.setFloorId(room.getFloor().getId());
        dto.setFloorName(room.getFloor().getName());
        return dto;
    }

    @GetMapping
    public List<RoomDTO> getAll() {
        return roomRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/floor/{floorId}")
    public List<RoomDTO> getByFloor(@PathVariable Long floorId) {
        return roomRepository.findByFloorId(floorId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RoomDTO dto) {
        return floorRepository.findById(dto.getFloorId()).map(floor -> {
            Room room = new Room();
            room.setRoomNumber(dto.getRoomNumber());
            room.setType(dto.getType());
            room.setFloor(floor);
            Room savedRoom = roomRepository.save(room);

            int capacity = 1;
            if (dto.getType() != null && dto.getType().contains("-")) {
                try {
                    capacity = Integer.parseInt(dto.getType().split("-")[0]);
                } catch (Exception e) {}
            }

            for (int i = 1; i <= capacity; i++) {
                com.hostel.management.model.Bed bed = new com.hostel.management.model.Bed();
                bed.setIdentifier("Bed " + i);
                bed.setStatus("available");
                bed.setRoom(savedRoom);
                bedRepository.save(bed);
            }

            return ResponseEntity.ok(toDTO(savedRoom));
        }).orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody RoomDTO dto) {
        return roomRepository.findById(id).map(room -> {
            room.setRoomNumber(dto.getRoomNumber());
            room.setType(dto.getType());
            if (dto.getFloorId() != null) {
                Floor floor = floorRepository.findById(dto.getFloorId()).orElse(null);
                if (floor != null) room.setFloor(floor);
            }
            return ResponseEntity.ok(toDTO(roomRepository.save(room)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (roomRepository.existsById(id)) {
                // Cascade delete associated beds first
                List<com.hostel.management.model.Bed> beds = bedRepository.findByRoomId(id);
                for (com.hostel.management.model.Bed bed : beds) {
                    bedRepository.deleteById(bed.getId());
                }

                roomRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Cannot delete this room. It is being referenced elsewhere.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting room: " + e.getMessage());
        }
    }
}

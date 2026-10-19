package com.hostel.management.controller;

import java.util.List;

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

import com.hostel.management.model.Building;
import com.hostel.management.model.Floor;
import com.hostel.management.model.Room;
import com.hostel.management.model.Bed;
import com.hostel.management.repository.BuildingRepository;
import com.hostel.management.repository.FloorRepository;
import com.hostel.management.repository.RoomRepository;
import com.hostel.management.repository.BedRepository;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    @GetMapping
    public List<Building> getAll() {
        return buildingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Building> getById(@PathVariable Long id) {
        return buildingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Building create(@RequestBody Building building) {
        return buildingRepository.save(building);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Building> update(@PathVariable Long id, @RequestBody Building updated) {
        return buildingRepository.findById(id).map(building -> {
            building.setName(updated.getName());
            return ResponseEntity.ok(buildingRepository.save(building));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (buildingRepository.existsById(id)) {
                // Cascade delete floors, rooms, and beds
                List<Floor> floors = floorRepository.findByBuildingId(id);
                for (Floor floor : floors) {
                    List<Room> rooms = roomRepository.findByFloorId(floor.getId());
                    for (Room room : rooms) {
                        List<Bed> beds = bedRepository.findByRoomId(room.getId());
                        for (Bed bed : beds) {
                            bedRepository.deleteById(bed.getId());
                        }
                        roomRepository.deleteById(room.getId());
                    }
                    floorRepository.deleteById(floor.getId());
                }

                buildingRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Cannot delete this building. It is being referenced elsewhere.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting building: " + e.getMessage());
        }
    }
}

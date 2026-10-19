package com.hostel.management.repository;

import com.hostel.management.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByRoomId(Long roomId);
    List<Bed> findByBookedById(Long studentId);

    @Query("SELECT b FROM Bed b JOIN b.room r JOIN r.floor f WHERE f.targetYear = :targetYear")
    List<Bed> findByFloorTargetYear(@Param("targetYear") Integer targetYear);
}

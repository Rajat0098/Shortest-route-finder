package com.routefinder.repository;

import com.routefinder.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    
    @Query("SELECT r FROM Route r WHERE r.sourceCity.id = :cityId OR r.destinationCity.id = :cityId")
    List<Route> findAllRoutesForCity(@Param("cityId") Long cityId);
}

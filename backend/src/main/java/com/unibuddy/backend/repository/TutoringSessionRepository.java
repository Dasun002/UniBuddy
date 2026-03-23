package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.TutoringSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TutoringSessionRepository extends JpaRepository<TutoringSession, Long> {
    
    // Find all bookings for a specific student (History)
    List<TutoringSession> findByStudentIdOrderBySessionDateDesc(String studentId);

package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "tutoring_sessions")
@Data
public class TutoringSession {
    @Id
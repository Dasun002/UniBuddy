package com.unibuddy.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.TutoringSession;
import com.unibuddy.backend.repository.TutoringSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class TutoringSessionService {

    @Autowired
    private TutoringSessionRepository repository;

    public TutoringSession bookSession(TutoringSession session) {
        if (repository.isTutorBooked(session.getTutorId(), session.getSessionDate(), session.getStartTime(), session.getEndTime())) {
            throw new RuntimeException("Scheduling Error: The selected tutor is unavailable at the requested time.");
        }
        return repository.save(session);
    }

    public List<TutoringSession> getStudentHistory(String studentId) {
        return repository.findByStudentIdOrderBySessionDateDesc(studentId);
    }

    public List<TutoringSession> getTutorSchedule(String tutorId) {
        return repository.findByTutorIdOrderBySessionDateDesc(tutorId);
    }

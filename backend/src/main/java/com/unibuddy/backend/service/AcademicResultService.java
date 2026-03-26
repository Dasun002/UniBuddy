package com.unibuddy.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.AcademicResult;
import com.unibuddy.backend.repository.AcademicResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AcademicResultService {

    @Autowired
    private AcademicResultRepository repository;

    public AcademicResult saveResult(AcademicResult result) {
        return repository.save(result);
    }

    public List<AcademicResult> getResultsByStudent(String studentId) {
        return repository.findByStudentId(studentId);
    }
    
    public List<AcademicResult> getResultsByStudentAndSemester(String studentId, int semester) {
        return repository.findByStudentIdAndSemester(studentId, semester);
    }

    public void deleteResult(Long id) {
        repository.deleteById(id);
    }

    public AcademicResult updateResult(Long id, AcademicResult updated) {
        return repository.findById(id).map(result -> {
            result.setSemester(updated.getSemester());
            result.setModuleCode(updated.getModuleCode());
            result.setModuleName(updated.getModuleName());
            result.setCredits(updated.getCredits());
            result.setGrade(updated.getGrade());
            result.setGradePoint(updated.getGradePoint());
            return repository.save(result);
        }).orElseThrow(() -> new RuntimeException("Result not found"));
    }

    public double calculateCGPA(String studentId) {
        List<AcademicResult> results = repository.findByStudentId(studentId);
        return computeGPA(results);
    }

    public double calculateSemesterGPA(String studentId, int semester) {
        List<AcademicResult> results = repository.findByStudentIdAndSemester(studentId, semester);
        return computeGPA(results);
    }

    private double computeGPA(List<AcademicResult> results) {
        if (results == null || results.isEmpty()) return 0.0;
        
        double totalPoints = 0;
        int totalCredits = 0;

        for (AcademicResult r : results) {
            totalPoints += (r.getGradePoint() * r.getCredits());
            totalCredits += r.getCredits();
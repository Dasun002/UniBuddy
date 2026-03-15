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
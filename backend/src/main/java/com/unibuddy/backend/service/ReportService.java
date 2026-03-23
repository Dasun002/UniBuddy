package com.unibuddy.backend.service;

import com.lowagie.text.Document;

import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.ForumAnswer;
import com.unibuddy.backend.model.ForumQuestion;
import com.unibuddy.backend.repository.ForumAnswerRepository;
import com.unibuddy.backend.repository.ForumQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ForumQuestionRepository questionRepo;
    private final ForumAnswerRepository answerRepo;

    public byte[] generateRecommendedQAPDF(Long questionId) {
        ForumQuestion q = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
                
        List<ForumAnswer> allAnswers = answerRepo.findByQuestionId(questionId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            
            document.open();
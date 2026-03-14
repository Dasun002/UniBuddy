import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { academicApi } from '../services/api';
import { appTheme } from '../theme/appTheme';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const SEMESTER_OPTIONS = [
  { value: '1', label: 'Y1S1' }, { value: '2', label: 'Y1S2' },
  { value: '3', label: 'Y2S1' }, { value: '4', label: 'Y2S2' },
  { value: '5', label: 'Y3S1' }, { value: '6', label: 'Y3S2' },
  { value: '7', label: 'Y4S1' }, { value: '8', label: 'Y4S2' },
];

const MODULE_OPTIONS = [
  { code: 'IT3010', name: 'NDM', credits: 4 },
  { code: 'IT3020', name: 'DS', credits: 4 },
  { code: 'IT3030', name: 'PAF', credits: 4 },
  { code: 'IT3040', name: 'ITPM', credits: 3 },
  { code: 'IT3050', name: 'ESD', credits: 2 },
];

const GRADE_OPTIONS = [
  { value: 'A+', points: 4.0 }, { value: 'A', points: 4.0 }, { value: 'A-', points: 3.7 },
  { value: 'B+', points: 3.3 }, { value: 'B', points: 3.0 }, { value: 'B-', points: 2.7 },
  { value: 'C+', points: 2.3 }, { value: 'C', points: 2.0 }, { value: 'E', points: 0.0 },
];

const getGradePoint = (grade: string) => {
  const found = GRADE_OPTIONS.find(g => g.value === grade.toUpperCase());
  return found ? found.points : 0.0;
};

const AcademicDashboardScreen = ({ route, navigation }: any) => {
  const { currentUserId } = route.params;

  const [results, setResults] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [semester, setSemester] = useState('1');
  const [moduleCode, setModuleCode] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');

  // Predictor State
  const [isPredictorVisible, setPredictorVisible] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');
  const [prediction, setPrediction] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await academicApi.getResultsByStudent(currentUserId);
      setResults(res.data);
      const cgpaRes = await academicApi.getCGPA(currentUserId);
      setCgpa(cgpaRes.data);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Unable to fetch academic data.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const handleAddResult = async () => {
    if (!moduleCode || !credits || !grade) {
      Alert.alert('Validation Required', 'Please complete all required fields.');
      return;
    }
    const gp = getGradePoint(grade);
    const payload = {
      studentId: currentUserId,
      semester: parseInt(semester),
      moduleCode,
      moduleName,
      credits: parseInt(credits),
      grade: grade.toUpperCase(),
      gradePoint: gp,
    };
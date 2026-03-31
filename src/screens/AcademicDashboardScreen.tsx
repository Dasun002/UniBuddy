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

    try {
      await academicApi.createResult(payload);
      setAddModalVisible(false);
      fetchDashboardData();
      
      setModuleCode('');
      setModuleName('');
      setCredits('');
      setGrade('');
    } catch (e) {
      Alert.alert('Error', 'Unable to save the result.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await academicApi.deleteResult(id);
      fetchDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Unable to delete the result.');
    }
  };

  const handlePredict = async () => {
    if (!targetCGPA || !remainingCredits) return;
    try {
      const res = await academicApi.predictGPA(currentUserId, parseFloat(targetCGPA), parseInt(remainingCredits));
      setPrediction(res.data);
    } catch (e) {
      Alert.alert('Error', 'Prediction failed. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Alert.alert('Download Initiated', 'Your PDF is being generated. Please wait.');
      const path = await academicApi.downloadReport(currentUserId);
      Alert.alert('Success', `PDF saved to ${path}`);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'An error occurred while downloading the PDF.');
    }
  };

  const semesters = [...new Set(results.map(r => r.semester))].sort((a,b)=>a-b);
  const trendData = semesters.map(sem => {
    const semResults = results.filter(r => r.semester === sem);
    const tPoints = semResults.reduce((acc, r) => acc + (r.gradePoint * r.credits), 0);
    const tCredits = semResults.reduce((acc, r) => acc + r.credits, 0);
    return tCredits > 0 ? (tPoints / tCredits) : 0;
  });

  const chartData = {
    labels: semesters.length > 0 ? semesters.map(s => `Sem ${s}`) : ['None'],
    datasets: [{ data: trendData.length > 0 ? trendData : [0] }]
  };

  const completedCredits = results.reduce((acc, r) => acc + r.credits, 0);
  const totalDegreeCredits = 120; // Example average target
  const pieData = [
    { name: 'Completed', credits: completedCredits, color: appTheme.colors.primary, legendFontColor: appTheme.colors.textPrimary, legendFontSize: 13 },
    { name: 'Remaining', credits: Math.max(0, totalDegreeCredits - completedCredits), color: '#ddd', legendFontColor: appTheme.colors.textPrimary, legendFontSize: 13 }
  ];

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent:'center' }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={500} style={styles.header}>
        <Text style={styles.title}>Analytics Hub</Text>
        <Text style={styles.cgpa}>CGPA: {cgpa.toFixed(2)}</Text>
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={100} duration={600} style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Progress Trends</Text>
        {semesters.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: appTheme.colors.glassStrong,
              backgroundGradientFrom: appTheme.colors.glassStrong,
              backgroundGradientTo: appTheme.colors.glassStrong,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(16, 42, 67, ${opacity})`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: appTheme.colors.primary }
            }}
            bezier
            style={styles.chart}
          />
        ) : <Text style={styles.emptyText}>Add results to see your trend</Text>}
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={200} duration={600} style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Credit Distribution</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 60}
          height={150}
          chartConfig={{ color: () => appTheme.colors.textPrimary }}
          accessor={"credits"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          absolute
        />
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={300} duration={500} style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.btnText}>+ Log Grade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => setPredictorVisible(true)}>
          <Text style={styles.btnTextDark}>Predictor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={handleDownloadPDF}>
          <Text style={styles.btnTextPrimary}>Generate Report</Text>
        </TouchableOpacity>
      </Animatable.View>

      <View style={styles.historySection}>
        <Animatable.Text animation="fadeIn" delay={400} style={styles.historyTitle}>History</Animatable.Text>
        {results.map((item, idx) => (
          <Animatable.View key={idx} animation="slideInRight" delay={400 + (idx * 50)} duration={400} style={styles.historyCard}>
            <View>
              <Text style={styles.modCode}>{item.moduleCode}</Text>
              <Text style={styles.modName}>Sem {item.semester} • {item.credits} Cr</Text>
            </View>
            <View style={styles.gradeBox}>
              <Text style={styles.gradeTxt}>{item.grade}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delBtn}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        ))}
      </View>

      {/* Add Grade Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
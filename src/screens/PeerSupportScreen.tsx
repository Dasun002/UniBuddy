import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { tutoringApi, userSearchApi } from '../services/api';
import { appTheme } from '../theme/appTheme';
import { useFocusEffect } from '@react-navigation/native';

const MODULE_OPTIONS = [
  { code: 'IT3010', name: 'NDM' },
  { code: 'IT3020', name: 'DS' },
  { code: 'IT3030', name: 'PAF' },
  { code: 'IT3040', name: 'ITPM' },
  { code: 'IT3050', name: 'ESD' },
];

const PeerSupportScreen = ({ route, navigation }: any) => {
  const { currentUserId } = route.params;

  const [history, setHistory] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'myBookings' | 'tutorRequests'>('myBookings');
  const [loading, setLoading] = useState(true);

  // Form State
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [tutorId, setTutorId] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [isDeclineModalVisible, setDeclineModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedRequestId, setSelectedSessionId] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);

  const [dateObj, setDateObj] = useState(new Date());
  const [startObj, setStartObj] = useState(new Date());
  const [endObj, setEndObj] = useState(new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setSessionDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setStartObj(selectedDate);
      const timeString = selectedDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      setStartTime(timeString);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setEndObj(selectedDate);
      const timeString = selectedDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      setEndTime(timeString);
    }
  };

  const handleTutorIdChange = async (text: string) => {
    setTutorId(text);
    if (text.length > 2) {
      try {
        const res = await userSearchApi.searchUsers(text);
        setSearchSuggestions(res.data);
      } catch (e) {
        console.log(e);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const selectTutor = (id: string) => {
    setTutorId(id);
    setSearchSuggestions([]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resHistory, resRequests] = await Promise.all([
        tutoringApi.getStudentHistory(currentUserId),
        tutoringApi.getTutorSchedule(currentUserId)
      ]);
      setHistory(resHistory.data);
      setTutorRequests(resRequests.data);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Unable to load tutoring sessions.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleBookSession = async () => {
    if (!tutorId || !moduleCode || !sessionDate || !startTime || !endTime) {
      Alert.alert('Validation Required', 'Please complete all fields.');
      return;
    }
    
    // Auto format time safely to HH:MM:SS for Spring Boot LocalTime bounds
    const formatTime = (t: string) => t.length <= 5 ? `${t}:00` : t;

    const payload = {
      studentId: currentUserId,
      tutorId: tutorId.toUpperCase(),
      moduleCode: moduleCode.toUpperCase(),
      sessionDate,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime)
    };

    try {
      await tutoringApi.bookSession(payload);
      Alert.alert('Success', 'Your tutoring request has been sent successfully.');
      setBookModalVisible(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Booking Failed', e.response?.data?.error || 'The selected slot is currently unavailable.');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await tutoringApi.cancelSession(id, currentUserId);
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Unable to cancel the session.');
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await tutoringApi.acceptSession(id, currentUserId);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Unable to accept the request.');
    }
  };

  const openDeclineModal = (id: number) => {
    setSelectedSessionId(id);
    setDeclineModalVisible(true);
  };

  const handleDecline = async () => {
    if (!selectedRequestId || !declineReason) {
      Alert.alert('Validation Required', 'Please provide a reason.');
      return;
    }
    try {
      await tutoringApi.declineSession(selectedRequestId, currentUserId, declineReason);
      setDeclineModalVisible(false);
      setDeclineReason('');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Unable to decline the request.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Alert.alert('Download Initiated', 'Please wait while the PDF summary is being generated.');
      const path = await tutoringApi.downloadReport(currentUserId);
      Alert.alert('Success', `PDF saved to ${path}`);
    } catch (e) {
      Alert.alert('Error', 'An error occurred while downloading the PDF.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent:'center' }} size="large" />;

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Text style={styles.title}>Peer Tutoring</Text>
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={100} style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setBookModalVisible(true)}>
          <Text style={styles.btnText}>+ Book Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={handleDownloadPDF}>
          <Text style={styles.btnTextPrimary}>Summary PDF</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="fadeIn" delay={200} style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'myBookings' && styles.activeTab]} onPress={() => setActiveTab('myBookings')}>
          <Text style={[styles.tabText, activeTab === 'myBookings' && styles.activeTabText]}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'tutorRequests' && styles.activeTab]} onPress={() => setActiveTab('tutorRequests')}>
          <Text style={[styles.tabText, activeTab === 'tutorRequests' && styles.activeTabText]}>Requests For Me</Text>
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView>
        {activeTab === 'myBookings' ? (
          <>
            {history.length === 0 ? <Text style={styles.empty}>No bookings found.</Text> : null}
            {history.map((item, idx) => (
              <Animatable.View key={idx} animation="fadeInUp" delay={idx * 100} style={styles.historyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modCode}>{item.moduleCode}</Text>
                  <Text style={styles.details}>Tutor: {item.tutorId}</Text>
                  <Text style={styles.details}>Date: {item.sessionDate}</Text>
                  <Text style={styles.details}>Time: {item.startTime} - {item.endTime}</Text>
                  <Text style={[styles.status, item.status === 'CANCELLED' || item.status === 'DECLINED' ? {color: 'red'} : item.status === 'COMPLETED' ? {color: 'green'} : item.status === 'PENDING' ? {color: 'orange'} : {}]}>{item.status}</Text>
                  {item.status === 'DECLINED' && item.declineReason && (
                    <Text style={{color: 'red', fontStyle:'italic', marginTop: 4}}>Reason: {item.declineReason}</Text>
                  )}
                </View>
                <View style={styles.actionBox}>
                  {(item.status === 'SCHEDULED' || item.status === 'PENDING') && (
                    <TouchableOpacity style={styles.delBtn} onPress={() => handleCancel(item.id)}>
                      <Text style={styles.delBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animatable.View>
            ))}
          </>
        ) : (
          <>
            {tutorRequests.length === 0 ? <Text style={styles.empty}>No requests found.</Text> : null}
            {tutorRequests.map((item, idx) => (
              <Animatable.View key={idx} animation="fadeInUp" delay={idx * 100} style={styles.historyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modCode}>{item.moduleCode}</Text>
                  <Text style={styles.details}>Student: {item.studentId}</Text>
                  <Text style={styles.details}>Date: {item.sessionDate}</Text>
                  <Text style={styles.details}>Time: {item.startTime} - {item.endTime}</Text>
                  <Text style={[styles.status, item.status === 'CANCELLED' || item.status === 'DECLINED' ? {color: 'red'} : item.status === 'COMPLETED' ? {color: 'green'} : item.status === 'PENDING' ? {color: 'orange'} : {}]}>{item.status}</Text>
                </View>
                <View style={[styles.actionBox, {flexDirection: 'row', gap: 5}]}>
                  {item.status === 'PENDING' && (
                    <>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                        <Text style={styles.acceptBtnText}>✓ Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => openDeclineModal(item.id)}>
                        <Text style={styles.delBtnText}>✗ Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {item.status === 'SCHEDULED' && (
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => {
                        tutoringApi.completeSession(item.id, currentUserId).then(() => fetchData());
                    }}>
                      <Text style={styles.acceptBtnText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animatable.View>
            ))}
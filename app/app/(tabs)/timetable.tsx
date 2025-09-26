import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';

const TimetableScreen = () => {
  const { session } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSave = async () => {
    if (!session) return;

    const { data, error } = await supabase.from('timetables').insert([
      {
        user_id: session.user.id,
        course_name: courseName,
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
      },
    ]);

    if (error) {
      console.error('Error saving timetable:', error);
    } else {
      // Clear form or show success message
      setCourseName('');
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add to Timetable</Text>
      <TextInput
        style={styles.input}
        placeholder="Course Name"
        value={courseName}
        onChangeText={setCourseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Day of Week (0-6)"
        value={dayOfWeek}
        onChangeText={setDayOfWeek}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Start Time (HH:MM)"
        value={startTime}
        onChangeText={setStartTime}
      />
      <TextInput
        style={styles.input}
        placeholder="End Time (HH:MM)"
        value={endTime}
        onChangeText={setEndTime}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default TimetableScreen;

import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { trackEvent } from '@/lib/analytics';

const ContributeScreen = () => {
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude.toString());
    setLongitude(location.coords.longitude.toString());
  };

  const handleSubmit = async () => {
    if (!session) {
      Alert.alert('Error', 'You must be logged in to contribute.');
      return;
    }

    const { error } = await supabase.from('contributions').insert([
      {
        user_id: session.user.id,
        name,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    ]);

    if (error) {
      Alert.alert('Error', 'Failed to submit contribution.');
      console.error('Error submitting contribution:', error);
    } else {
      trackEvent('contribute');
      Alert.alert('Success', 'Thank you for your contribution!');
      setName('');
      setDescription('');
      setLatitude('');
      setLongitude('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contribute a New Spot</Text>
      <TextInput style={styles.input} placeholder="Spot Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <View style={styles.locationContainer}>
        <TextInput style={styles.locationInput} placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
        <TextInput style={styles.locationInput} placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
      </View>
      <Button title="Get Current Location" onPress={handleGetLocation} />
      <Button title="Submit" onPress={handleSubmit} />
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
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    width: '48%',
  },
});

export default ContributeScreen;

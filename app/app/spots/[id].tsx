import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { trackEvent } from '@/lib/analytics';

const SpotDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [spot, setSpot] = useState<any>(null);
  const [congestion, setCongestion] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchSpot = async () => {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching spot details:', error);
      } else {
        setSpot(data);
      }
    };

    const fetchCongestion = async () => {
      const { data, error } = await supabase.rpc('get_congestion_level', { spot_id_param: id });
      if (error) {
        console.error('Error fetching congestion level:', error);
      } else {
        setCongestion(data);
      }
    };

    fetchSpot();
    fetchCongestion();
  }, [id]);

  const handleCheckIn = async () => {
    if (!session) {
      Alert.alert('Error', 'You must be logged in to check in.');
      return;
    }

    const { data, error } = await supabase.rpc('handle_check_in', {
      p_user_id: session.user.id,
      p_spot_id: id,
    });

    if (error) {
      Alert.alert('Error', 'Failed to check in.');
      console.error('Error checking in:', error);
    } else {
      trackEvent('checkIn', { spotId: id });
      Alert.alert('Success', 'You have checked in successfully!');
      // Optionally, you can use the returned data to update the UI
    }
  };

  if (!spot) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{spot.name}</Text>
      {congestion && <Text style={styles.congestion}>Congestion: {congestion}</Text>}
      <Text style={styles.description}>{spot.description}</Text>
      <Button title="Check-in" onPress={handleCheckIn} />
      {/* Add more details here, e.g., photos, seat types, power outlets */}
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
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  congestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'blue',
  },
});

export default SpotDetailsScreen;

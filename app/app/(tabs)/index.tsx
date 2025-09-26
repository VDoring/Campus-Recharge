import { StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';

export default function TabOneScreen() {
  const { session } = useAuth();
  const [spots, setSpots] = useState<any[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (!session) return;

    const fetchUserPoints = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('points')
        .eq('id', session.user.id)
        .single();
      if (!error) {
        setUserPoints(data.points);
      }
    };
    fetchUserPoints();
  }, [session]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    const fetchSpots = async () => {
      let query = supabase.from('spots').select('*');
      if (userPoints < 100) {
        query = query.eq('is_hidden', false);
      }
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching spots:', error);
      } else {
        setSpots(data);
      }
    };

    if (session) {
      fetchSpots();
    }
  }, [session, userPoints]);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Spots</Text>
      <Text style={styles.locationText}>{text}</Text>
      <FlatList
        data={spots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.spotContainer}>
            <Text style={styles.spotName}>{item.name}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 20,
  },
  spotContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  spotName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

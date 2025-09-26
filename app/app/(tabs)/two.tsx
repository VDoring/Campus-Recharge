import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';

export default function TabTwoScreen() {
  const { session } = useAuth();
  const [spots, setSpots] = useState<any[]>([]);
  const [congestionLevels, setCongestionLevels] = useState<any>({});
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const router = useRouter();

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

    const fetchCongestionLevels = async () => {
      const { data, error } = await supabase.rpc('get_all_congestion_levels');
      if (error) {
        console.error('Error fetching congestion levels:', error);
      } else {
        const levels = data.reduce((acc: any, item: any) => {
          acc[item.spot_id] = item.congestion_level;
          return acc;
        }, {});
        setCongestionLevels(levels);
      }
    };

    if (session) {
      fetchSpots();
      fetchCongestionLevels();
    }
  }, [session, userPoints]);

  const handleMarkerPress = (spotId: number) => {
    router.push(`/spots/${spotId}`);
  };

  const getMarkerColor = (spotId: number) => {
    const level = congestionLevels[spotId];
    if (level === '혼잡') return 'red';
    if (level === '보통') return 'orange';
    return 'green';
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name}
            description={spot.description}
            pinColor={getMarkerColor(spot.id)}
            onPress={() => handleMarkerPress(spot.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

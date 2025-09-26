import { View, Button, StyleSheet, Text } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useEffect } from 'react';

const ProfileScreen = () => {
  const { session } = useAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!session) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data);
      }
    };

    fetchUser();
  }, [session]);

  return (
    <View style={styles.container}>
      {session && <Text style={styles.email}>Signed in as: {session.user.email}</Text>}
      {user && (
        <View style={styles.statsContainer}>
          <Text style={styles.stat}>Points: {user.points}</Text>
          <Text style={styles.stat}>Streak: {user.streak_count} days</Text>
        </View>
      )}
      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stat: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ProfileScreen;

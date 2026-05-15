import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/utils/colors';
import { useAuth } from '../../src/context/AuthContext';
import { updateProfileApi } from '../../src/api';
import { Input, Button, Card, EmptyState } from '../../src/components/UI';

function MenuItem({ icon, label, value, onPress, danger, rightIcon = 'chevron-forward' }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.menuItem}>
      <View style={[s.menuIcon, danger && { backgroundColor: '#fee2e2' }]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.danger : Colors.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {value ? <Text style={s.menuValue}>{value}</Text> : null}
      </View>
      <Ionicons name={rightIcon} size={16} color={danger ? Colors.danger : Colors.gray400} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router  = useRouter();
  const [editing,  setEditing]  = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone,    setPhone]    = useState(user?.phone || '');
  const [saving,   setSaving]   = useState(false);

  if (!isAuthenticated) return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>
      <EmptyState
        icon="👤"
        title="Not Signed In"
        subtitle="Sign in to view your profile and manage your account."
        action={() => router.push('/login')}
        actionLabel="Sign In"
      />
    </View>
  );

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/');
      }},
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileApi({ full_name: fullName.trim(), phone: phone.trim() });
      Alert.alert('Success', 'Profile updated successfully.');
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar card */}
        <Card style={s.avatarCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.userName}>{user?.full_name}</Text>
          <Text style={s.userEmail}>{user?.email}</Text>
          {user?.phone ? (
            <View style={s.phonePill}>
              <Text style={s.phonePillText}>{user.phone}</Text>
            </View>
          ) : null}
          <View style={s.rolePill}>
            <Text style={s.rolePillText}>Guest Account</Text>
          </View>
        </Card>

        {/* Edit profile */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Account Details</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.blue }}>
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <Card style={{ padding: 20 }}>
            {editing ? (
              <>
                <Input label="Full Name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
                <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <View style={{ marginTop: 4, flexDirection: 'row', gap: 10 }}>
                  <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                  <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 2 }} />
                </View>
              </>
            ) : (
              <>
                {[
                  ['person-outline', 'Full Name',     user?.full_name],
                  ['mail-outline',   'Email',         user?.email],
                  ['call-outline',   'Phone',         user?.phone || 'Not provided'],
                ].map(([icon, label, value]) => (
                  <View key={label} style={s.infoRow}>
                    <Ionicons name={icon} size={16} color={Colors.gray400} style={{ marginRight: 10 }} />
                    <View>
                      <Text style={s.infoLabel}>{label}</Text>
                      <Text style={s.infoValue}>{value}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </Card>
        </View>

        {/* Quick links */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <Card style={{ marginTop: 10, overflow: 'hidden' }}>
            <MenuItem icon="calendar-outline"  label="My Reservations" onPress={() => router.push('/bookings')} />
            <View style={s.menuDivider} />
            <MenuItem icon="search-outline"    label="Search Rooms"    onPress={() => router.push('/search')} />
            <View style={s.menuDivider} />
            <MenuItem icon="bed-outline"       label="Browse Rooms"    onPress={() => router.push('/rooms')} />
          </Card>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20 }}>
          <Card style={{ overflow: 'hidden' }}>
            <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header:      { backgroundColor: Colors.navy, paddingTop: 16, paddingBottom: 24, paddingHorizontal: 24 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  avatarCard:  { margin: 20, marginTop: 20, padding: 24, alignItems: 'center' },
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { fontSize: 26, fontWeight: '800', color: Colors.white },
  userName:    { fontSize: 20, fontWeight: '800', color: Colors.navy, letterSpacing: -0.3 },
  userEmail:   { fontSize: 13, color: Colors.gray400, marginTop: 4 },
  phonePill:   { backgroundColor: Colors.gray100, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, marginTop: 8 },
  phonePillText: { fontSize: 12, color: Colors.gray600 },
  rolePill:    { backgroundColor: Colors.bluePale, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, marginTop: 6 },
  rolePillText: { fontSize: 11, fontWeight: '700', color: Colors.blue, letterSpacing: 0.3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle:  { fontSize: 14, fontWeight: '800', color: Colors.navy, letterSpacing: 0.2 },
  infoRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  infoLabel:   { fontSize: 11, color: Colors.gray400, fontWeight: '500' },
  infoValue:   { fontSize: 14, color: Colors.navy, fontWeight: '600', marginTop: 1 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIcon:    { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.bluePale, alignItems: 'center', justifyContent: 'center' },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: Colors.navy },
  menuValue:   { fontSize: 12, color: Colors.gray400, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: Colors.gray100, marginLeft: 62 },
});

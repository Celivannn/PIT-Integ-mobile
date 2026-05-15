import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../src/utils/colors';
import { useAuth } from '../../src/context/AuthContext';
import { Input, Button } from '../../src/components/UI';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router       = useRouter();
  const [form, setForm]     = useState({ full_name: '', email: '', phone: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (form.password !== form.password2) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        email:     form.email.trim().toLowerCase(),
        phone:     form.phone.trim(),
        password:  form.password,
        password2: form.password2,
      });
      Alert.alert('Account Created!', 'You can now sign in with your credentials.', [
        { text: 'Sign In', onPress: () => router.replace('/login') },
      ]);
    } catch (e) {
      const err = e.response?.data;
      const msg = err?.email?.[0] || err?.password?.[0] || err?.detail || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#0a1e3d', '#0f2b4c', '#1a3a5c']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoBox}>
            <Text style={s.logoName}>Grand Azure</Text>
            <Text style={s.logoSub}>HOTEL & RESORT</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join us for a seamless booking experience</Text>

            <Input
              label="Full Name *"
              value={form.full_name}
              onChangeText={v => set('full_name', v)}
              placeholder="Juan dela Cruz"
              autoCapitalize="words"
            />
            <Input
              label="Email Address *"
              value={form.email}
              onChangeText={v => set('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <Input
              label="Phone Number (optional)"
              value={form.phone}
              onChangeText={v => set('phone', v)}
              keyboardType="phone-pad"
              placeholder="+63 912 345 6789"
            />
            <Input
              label="Password *"
              value={form.password}
              onChangeText={v => set('password', v)}
              secureTextEntry
              placeholder="Min. 8 characters"
            />
            <Input
              label="Confirm Password *"
              value={form.password2}
              onChangeText={v => set('password2', v)}
              secureTextEntry
              placeholder="Repeat your password"
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <View style={s.loginRow}>
              <Text style={s.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={s.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoBox:   { alignItems: 'center', marginBottom: 28 },
  logoName:  { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  logoSub:   { fontSize: 10, letterSpacing: 3, color: Colors.gold, marginTop: 3, fontWeight: '600' },
  card:      { backgroundColor: Colors.white, borderRadius: 20, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12 },
  title:     { fontSize: 22, fontWeight: '800', color: Colors.navy, marginBottom: 4, letterSpacing: -0.4 },
  subtitle:  { fontSize: 13, color: Colors.gray400, marginBottom: 24 },
  loginRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 13, color: Colors.gray400 },
  loginLink: { fontSize: 13, color: Colors.blue, fontWeight: '700' },
});

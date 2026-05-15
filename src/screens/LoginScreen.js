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

export default function LoginScreen() {
  const { login } = useAuth();
  const router    = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.detail || 'Invalid credentials. Please try again.');
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
            <View style={s.logoCircle}>
              <Text style={{ fontSize: 32 }}>🏨</Text>
            </View>
            <Text style={s.logoName}>Grand Azure</Text>
            <Text style={s.logoSub}>HOTEL & RESORT</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.subtitle}>Sign in to manage your reservations</Text>

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Your password"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity
              style={s.registerBtn}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Text style={s.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>

            <Text style={s.note}>
              This portal is for guests only. Hotel staff use the admin dashboard.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  logoBox:      { alignItems: 'center', marginBottom: 32 },
  logoCircle:   { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoName:     { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  logoSub:      { fontSize: 10, letterSpacing: 3, color: Colors.gold, marginTop: 3, fontWeight: '600' },
  card:         { backgroundColor: Colors.white, borderRadius: 20, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12 },
  title:        { fontSize: 22, fontWeight: '800', color: Colors.navy, marginBottom: 4, letterSpacing: -0.4 },
  subtitle:     { fontSize: 13, color: Colors.gray400, marginBottom: 24 },
  divider:      { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine:  { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  dividerText:  { marginHorizontal: 12, fontSize: 13, color: Colors.gray400 },
  registerBtn:  { borderWidth: 1.5, borderColor: Colors.blue, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  registerBtnText: { color: Colors.blue, fontWeight: '700', fontSize: 15 },
  note:         { fontSize: 11, color: Colors.gray400, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});

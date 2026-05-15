import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../src/utils/colors';
import { useAuth } from '../../src/context/AuthContext';
import { Input, Button } from '../../src/components/UI';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError(validateEmail(text));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError(validatePassword(text));
  };

  const handleLogin = async () => {
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) setEmailError(emailValidationError);
    if (passwordValidationError) setPasswordError(passwordValidationError);

    if (emailValidationError || passwordValidationError) {
      Alert.alert('Validation Error', 'Please check your credentials and try again.');
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

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address to receive reset instructions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            if (email) {
              Alert.alert('Success', 'Password reset link sent to your email.');
            } else {
              Alert.alert('Error', 'Please enter your email address first.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0a1e3d', '#0f2b4c', '#1a3a5c']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Background Elements */}
        <View style={s.decorCircle1} />
        <View style={s.decorCircle2} />
        <View style={s.decorCircle3} />

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Logo Section */}
          <Animated.View
            style={[
              s.logoBox,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={s.logoCircle}
            >
              <Text style={s.logoEmoji}>🏨</Text>
            </LinearGradient>
            <Text style={s.logoName}>Grand Azure</Text>
            <View style={s.logoBadge}>
              <Text style={s.logoBadgeText}>★★★★★</Text>
            </View>
            <Text style={s.logoSub}>HOTEL & RESORT</Text>
          </Animated.View>

          {/* Animated Card */}
          <Animated.View
            style={[
              s.card,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={s.cardHeader}>
              <Text style={s.title}>Welcome Back</Text>
              <Text style={s.subtitle}>Sign in to manage your reservations</Text>
            </View>

            <Input
              label="Email Address"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
              leftIcon="📧"
              error={emailError}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              placeholder="Your password"
              leftIcon="🔒"
              error={passwordError}
            />

            <TouchableOpacity
              style={s.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={s.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={s.loginButton}
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
              <LinearGradient
                colors={['transparent', 'transparent']}
                style={s.registerBtnGradient}
              >
                <Text style={s.registerBtnText}>Create New Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Social Login Options */}
            <View style={s.socialSection}>
              <Text style={s.socialTitle}>Or continue with</Text>
              <View style={s.socialButtons}>
                <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
                  <Text style={s.socialIcon}>G</Text>
                  <Text style={s.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
                  <Text style={s.socialIcon}>f</Text>
                  <Text style={s.socialText}>Facebook</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
                  <Text style={s.socialIcon}>🐦</Text>
                  <Text style={s.socialText}>Twitter</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.note}>
              This portal is for guests only. Hotel staff use the admin dashboard.
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(30,95,168,0.1)',
  },
  decorCircle3: {
    position: 'absolute',
    top: '30%',
    left: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoEmoji: {
    fontSize: 42,
  },
  logoName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  logoBadge: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  logoBadgeText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '600',
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.goldLight,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  cardHeader: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    lineHeight: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: Colors.blue,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: Colors.gray500,
    fontWeight: '500',
  },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: Colors.blue,
    borderRadius: 14,
    overflow: 'hidden',
  },
  registerBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerBtnText: {
    color: Colors.blue,
    fontWeight: '700',
    fontSize: 15,
  },
  socialSection: {
    marginTop: 24,
  },
  socialTitle: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    gap: 8,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  socialText: {
    fontSize: 13,
    color: Colors.gray700,
    fontWeight: '600',
  },
  note: {
    fontSize: 11,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 16,
  },
});
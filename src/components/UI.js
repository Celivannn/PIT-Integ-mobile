import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput,
} from 'react-native';
import { Colors, StatusColors } from '../utils/colors';
import { capitalize } from '../utils/helpers';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const styles = btnStyles;
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'primary'  && styles.primary,
        variant === 'gold'     && styles.gold,
        variant === 'outline'  && styles.outline,
        variant === 'danger'   && styles.danger,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' ? Colors.blue : Colors.white} size="small" />
        : <Text style={[styles.text, variant === 'outline' && styles.textOutline, variant === 'gold' && styles.textGold]}>
            {title}
          </Text>
      }
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  base:        { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary:     { backgroundColor: Colors.blue },
  gold:        { backgroundColor: Colors.gold },
  outline:     { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.blue },
  danger:      { backgroundColor: '#fee2e2' },
  disabled:    { opacity: 0.55 },
  text:        { color: Colors.white, fontWeight: '700', fontSize: 15 },
  textOutline: { color: Colors.blue },
  textGold:    { color: Colors.navy },
});

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.gray600, marginBottom: 5, letterSpacing: 0.3 }}>{label}</Text>}
      <TextInput
        style={[{
          borderWidth: 1.5,
          borderColor: focused ? Colors.blue : error ? Colors.danger : Colors.gray200,
          borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
          fontSize: 15, color: Colors.gray800, backgroundColor: Colors.white,
        }, style]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={Colors.gray400}
        {...props}
      />
      {error && <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const c = StatusColors[status] || { bg: Colors.gray100, text: Colors.gray600 };
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: c.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {capitalize(status)}
      </Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: Colors.white, borderRadius: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
      borderWidth: 1, borderColor: Colors.gray100,
    }, style]}>
      {children}
    </View>
  );
}

// ─── Screen Header ────────────────────────────────────────────────────────────
export function ScreenHeader({ title, subtitle }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.navy, letterSpacing: -0.5 }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 14, color: Colors.gray400, marginTop: 3 }}>{subtitle}</Text>}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ width, height, style }) {
  return (
    <View style={[{ width, height: height || 16, borderRadius: 8, backgroundColor: Colors.gray100 }, style]} />
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action, actionLabel }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Text style={{ fontSize: 52, marginBottom: 16 }}>{icon}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.navy, marginBottom: 8, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 14, color: Colors.gray400, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>{subtitle}</Text>}
      {action && <Button title={actionLabel} onPress={action} />}
    </View>
  );
}

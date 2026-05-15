import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/utils/colors';
import { formatCurrency, getNights, getTodayStr, getTomorrowStr } from '../../src/utils/helpers';
import { getRoomApi, createReservationApi } from '../../src/api';
import { Button, Card } from '../../src/components/UI';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const params  = useLocalSearchParams();
  const router  = useRouter();

  const [room,       setRoom]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [booking,    setBooking]    = useState(null);
  const [checkIn,    setCheckIn]    = useState(params.check_in  || getTodayStr());
  const [checkOut,   setCheckOut]   = useState(params.check_out || getTomorrowStr());
  const [guests,     setGuests]     = useState(1);

  useEffect(() => {
    // id is a string from expo-router params — keep it as string, never parseInt
    getRoomApi(id).then(r => setRoom(r.data)).finally(() => setLoading(false));
  }, [id]);

  const nights = getNights(checkIn, checkOut);
  const total  = room ? Number(room.room_type?.base_price) * nights : 0;

  const handleConfirm = async () => {
    // Validate dates before submitting
    if (!checkIn || !checkOut) {
      Alert.alert('Missing Dates', 'Please enter check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      Alert.alert('Invalid Dates', 'Check-out must be after check-in.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await createReservationApi({
        room:      id,           // ← string, NOT parseInt — preserves CockroachDB 64-bit ID
        check_in:  checkIn,
        check_out: checkOut,
        guests:    parseInt(guests), // guests is a small number, safe to parseInt
      });
      setBooking(data);
      setStep(3);
    } catch (e) {
      console.log('Booking error:', JSON.stringify(e.response?.data));
      const msg =
        e.response?.data?.non_field_errors?.[0] ||
        e.response?.data?.room?.[0] ||
        e.response?.data?.detail ||
        Object.values(e.response?.data || {})?.[0]?.[0] ||
        'Booking failed. Please try again.';
      Alert.alert('Booking Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Colors.blue} />
    </View>
  );

  if (!room) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: Colors.gray400 }}>Room not found.</Text>
    </View>
  );

  // ── Success screen ───────────────────────────────────────────────────────────
  if (step === 3) return (
    <View style={{ flex: 1, backgroundColor: Colors.white, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
      <View style={s.successIcon}>
        <Ionicons name="checkmark" size={40} color={Colors.success} />
      </View>
      <Text style={s.successTitle}>Booking Confirmed!</Text>
      <Text style={s.successSub}>Your reservation has been created successfully.</Text>

      <Card style={{ width: '100%', padding: 20, marginTop: 28, marginBottom: 28 }}>
        {[
          ['Booking Ref', booking?.booking_ref],
          ['Room',        `Room ${room?.room_number}`],
          ['Check In',    checkIn],
          ['Check Out',   checkOut],
          ['Guests',      guests],
          ['Nights',      nights],
          ['Total',       formatCurrency(total)],
          ['Payment',     'Pay at hotel'],
          ['Status',      'Pending'],
        ].map(([k, v]) => (
          <View key={k} style={s.detailRow}>
            <Text style={s.detailKey}>{k}</Text>
            <Text style={s.detailVal}>{String(v)}</Text>
          </View>
        ))}
      </Card>

      <Button
        title="View My Bookings"
        onPress={() => router.replace('/(tabs)/bookings')}
        style={{ width: '100%', marginBottom: 12 }}
      />
      <Button
        title="Back to Home"
        variant="outline"
        onPress={() => router.replace('/(tabs)')}
        style={{ width: '100%' }}
      />
    </View>
  );

  // ── Booking form ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => step === 1 ? router.back() : setStep(1)}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Reserve Your Room</Text>
        {/* Step indicator */}
        <View style={s.steps}>
          {[1, 2].map(n => (
            <View key={n} style={{ alignItems: 'center', flexDirection: 'row' }}>
              <View style={[s.stepDot, step >= n && s.stepDotActive]}>
                <Text style={[s.stepNum, step >= n && s.stepNumActive]}>{n}</Text>
              </View>
              {n < 2 && <View style={[s.stepLine, step > 1 && s.stepLineActive]} />}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Room summary card */}
        <Card style={{ flexDirection: 'row', marginBottom: 20, overflow: 'hidden' }}>
          <View style={{
            width: 80, backgroundColor: Colors.bluePale,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 32 }}>🏨</Text>
          </View>
          <View style={{ flex: 1, padding: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.navy }}>
              Room {room?.room_number}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.gray400, marginTop: 2, textTransform: 'capitalize' }}>
              {room?.room_type?.name} · Floor {room?.floor}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.blue, marginTop: 6 }}>
              {formatCurrency(room?.room_type?.base_price)}
              <Text style={{ fontSize: 11, fontWeight: '400', color: Colors.gray400 }}>/night</Text>
            </Text>
          </View>
        </Card>

        {/* Step 1 — Stay Details */}
        {step === 1 && (
          <Card style={{ padding: 20 }}>
            <Text style={s.stepTitle}>Stay Details</Text>

            <Text style={s.inputLabel}>Check In Date</Text>
            <TextInput
              style={s.input}
              value={checkIn}
              onChangeText={setCheckIn}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.gray400}
            />

            <Text style={s.inputLabel}>Check Out Date</Text>
            <TextInput
              style={s.input}
              value={checkOut}
              onChangeText={setCheckOut}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.gray400}
            />

            <Text style={s.inputLabel}>
              Number of Guests (max {room?.room_type?.capacity})
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {Array.from(
                { length: room?.room_type?.capacity || 2 },
                (_, i) => i + 1
              ).map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setGuests(n)}
                  style={[s.guestBtn, guests === n && s.guestBtnActive]}
                >
                  <Text style={[s.guestBtnText, guests === n && s.guestBtnTextActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {nights > 0 && (
              <View style={s.summaryPill}>
                <Text style={s.summaryPillText}>
                  {nights} night{nights > 1 ? 's' : ''} · {formatCurrency(total)} total
                </Text>
              </View>
            )}

            <Button
              title="Continue to Confirm →"
              onPress={() => {
                if (!checkIn || !checkOut) {
                  Alert.alert('Missing Dates', 'Please enter both check-in and check-out dates.');
                  return;
                }
                if (new Date(checkOut) <= new Date(checkIn)) {
                  Alert.alert('Invalid Dates', 'Check-out must be after check-in.');
                  return;
                }
                setStep(2);
              }}
              style={{ marginTop: 14 }}
            />
          </Card>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <Card style={{ padding: 20 }}>
            <Text style={s.stepTitle}>Confirm Booking</Text>

            {[
              ['Room',        `Room ${room?.room_number} (${room?.room_type?.name})`],
              ['Floor',       `Floor ${room?.floor}`],
              ['Check In',    checkIn],
              ['Check Out',   checkOut],
              ['Nights',      nights],
              ['Guests',      guests],
              ['Price/Night', formatCurrency(room?.room_type?.base_price)],
            ].map(([k, v]) => (
              <View key={k} style={s.detailRow}>
                <Text style={s.detailKey}>{k}</Text>
                <Text style={[s.detailVal, { color: Colors.gray800 }]}>{String(v)}</Text>
              </View>
            ))}

            <View style={[s.detailRow, {
              borderTopWidth: 1.5, borderTopColor: Colors.gray200,
              paddingTop: 12, marginTop: 4,
            }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.navy }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.blue }}>
                {formatCurrency(total)}
              </Text>
            </View>

            <View style={s.notice}>
              <Text style={s.noticeText}>💳 Payment collected at hotel check-in</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button
                title="← Back"
                variant="outline"
                onPress={() => setStep(1)}
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Booking"
                variant="gold"
                onPress={handleConfirm}
                loading={submitting}
                style={{ flex: 2 }}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header:          { backgroundColor: Colors.navy, paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn:         { marginBottom: 12 },
  headerTitle:     { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.5, marginBottom: 16 },
  steps:           { flexDirection: 'row', alignItems: 'center' },
  stepDot:         { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  stepDotActive:   { backgroundColor: Colors.gold },
  stepNum:         { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  stepNumActive:   { color: Colors.navy },
  stepLine:        { width: 32, height: 2, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 4 },
  stepLineActive:  { backgroundColor: Colors.gold },
  stepTitle:       { fontSize: 18, fontWeight: '800', color: Colors.navy, marginBottom: 18 },
  inputLabel:      { fontSize: 12, fontWeight: '600', color: Colors.gray600, marginBottom: 5 },
  input:           { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: 10, padding: 12, fontSize: 15, color: Colors.gray800, marginBottom: 14 },
  guestBtn:        { width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.gray200, alignItems: 'center', justifyContent: 'center' },
  guestBtnActive:  { borderColor: Colors.blue, backgroundColor: Colors.bluePale },
  guestBtnText:    { fontSize: 15, fontWeight: '700', color: Colors.gray600 },
  guestBtnTextActive: { color: Colors.blue },
  summaryPill:     { backgroundColor: Colors.bluePale, padding: 12, borderRadius: 10 },
  summaryPillText: { fontSize: 14, fontWeight: '700', color: Colors.blue, textAlign: 'center' },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  detailKey:       { fontSize: 13, color: Colors.gray400, fontWeight: '500' },
  detailVal:       { fontSize: 13, fontWeight: '700', color: Colors.navy },
  notice:          { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 8, padding: 10, marginTop: 14 },
  noticeText:      { fontSize: 12, color: '#92400e' },
  successIcon:     { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle:    { fontSize: 26, fontWeight: '800', color: Colors.navy, marginBottom: 8 },
  successSub:      { fontSize: 14, color: Colors.gray400, textAlign: 'center', marginBottom: 4 },
});
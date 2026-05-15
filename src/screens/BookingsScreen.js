import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/utils/colors';
import { formatCurrency, formatDate, getNights } from '../../src/utils/helpers';
import { getMyReservationsApi, cancelReservationApi } from '../../src/api';
import { StatusBadge, EmptyState, Card } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';

export default function BookingsScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [cancelling,   setCancelling]   = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getMyReservationsApi();
      setReservations(data.results || data);
    } catch { setReservations([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated]);

  const handleCancel = (id) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(id);
          try {
            await cancelReservationApi(id);
            load();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.detail || 'Could not cancel reservation.');
          } finally {
            setCancelling(null);
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) return (
    <EmptyState
      icon="🔐"
      title="Sign In Required"
      subtitle="Please sign in to view your reservations."
      action={() => router.push('/login')}
      actionLabel="Sign In"
    />
  );

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Colors.blue} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>My Reservations</Text>
        <Text style={s.headerSub}>View and manage your bookings</Text>
      </View>

      {reservations.length === 0 ? (
        <EmptyState
          icon="🏨"
          title="No Reservations Yet"
          subtitle="Start by browsing our available rooms."
          action={() => router.push('/rooms')}
          actionLabel="Browse Rooms"
        />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 20, gap: 14 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.blue} />}
          renderItem={({ item: r }) => {
            const nights = getNights(r.check_in, r.check_out);
            return (
              <Card style={{ padding: 16 }}>
                {/* Top row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View>
                    <Text style={s.bookingRef}>{r.booking_ref}</Text>
                    <Text style={s.roomInfo}>
                      Room {r.room?.room_number} · {r.room?.room_type?.name}
                    </Text>
                  </View>
                  <StatusBadge status={r.status} />
                </View>

                {/* Dates row */}
                <View style={s.datesRow}>
                  <View style={s.dateBox}>
                    <Text style={s.dateLabel}>CHECK IN</Text>
                    <Text style={s.dateValue}>{formatDate(r.check_in)}</Text>
                  </View>
                  <View style={s.nightsPill}>
                    <Text style={s.nightsText}>{nights}N</Text>
                  </View>
                  <View style={[s.dateBox, { alignItems: 'flex-end' }]}>
                    <Text style={s.dateLabel}>CHECK OUT</Text>
                    <Text style={s.dateValue}>{formatDate(r.check_out)}</Text>
                  </View>
                </View>

                {/* Bottom row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray100 }}>
                  <View>
                    <Text style={{ fontSize: 11, color: Colors.gray400 }}>{r.guests} guest{r.guests > 1 ? 's' : ''}</Text>
                    <Text style={s.totalPrice}>{formatCurrency(r.total_price)}</Text>
                    <Text style={{ fontSize: 11, color: Colors.gray400 }}>Pay at hotel</Text>
                  </View>
                  {r.can_cancel && (
                    <TouchableOpacity
                      onPress={() => handleCancel(r.id)}
                      disabled={cancelling === r.id}
                      style={s.cancelBtn}
                    >
                      <Text style={s.cancelBtnText}>
                        {cancelling === r.id ? 'Cancelling...' : 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header:       { backgroundColor: Colors.navy, paddingTop: 16, paddingBottom: 24, paddingHorizontal: 24 },
  headerTitle:  { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  bookingRef:   { fontSize: 13, fontWeight: '800', color: Colors.blue, fontVariant: ['tabular-nums'], letterSpacing: 0.5 },
  roomInfo:     { fontSize: 12, color: Colors.gray400, marginTop: 2, textTransform: 'capitalize' },
  datesRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray50, borderRadius: 10, padding: 12 },
  dateBox:      { flex: 1 },
  dateLabel:    { fontSize: 10, fontWeight: '700', color: Colors.gray400, letterSpacing: 0.5 },
  dateValue:    { fontSize: 13, fontWeight: '700', color: Colors.navy, marginTop: 2 },
  nightsPill:   { backgroundColor: Colors.navy, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginHorizontal: 8 },
  nightsText:   { fontSize: 11, fontWeight: '800', color: Colors.white },
  totalPrice:   { fontSize: 17, fontWeight: '800', color: Colors.blue },
  cancelBtn:    { backgroundColor: '#fee2e2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: Colors.danger },
});

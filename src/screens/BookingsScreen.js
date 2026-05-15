import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/utils/colors';
import { formatCurrency, formatDate, getNights } from '../../src/utils/helpers';
import { getMyReservationsApi, cancelReservationApi } from '../../src/api';
import { StatusBadge, EmptyState, Card } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';

function ReservationCard({ r, cancelling, onCancel }) {
  const nights = getNights(r.check_in, r.check_out);

  return (
    <Card style={s.card}>
      {/* Header band */}
      <View style={s.cardHeader}>
        <View style={s.cardHeaderLeft}>
          <Text style={s.bookingRef}>{r.booking_ref}</Text>
          <Text style={s.roomInfo}>
            Room {r.room?.room_number}
            <Text style={s.roomTypeDot}> · </Text>
            {r.room?.room_type?.name}
          </Text>
        </View>
        <StatusBadge status={r.status} />
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Dates section */}
      <View style={s.datesRow}>
        <View style={s.dateBlock}>
          <Text style={s.dateLabel}>CHECK‑IN</Text>
          <Text style={s.dateValue}>{formatDate(r.check_in)}</Text>
        </View>

        <View style={s.nightsBadge}>
          <Text style={s.nightsCount}>{nights}</Text>
          <Text style={s.nightsUnit}>nights</Text>
        </View>

        <View style={[s.dateBlock, s.dateBlockRight]}>
          <Text style={s.dateLabel}>CHECK‑OUT</Text>
          <Text style={s.dateValue}>{formatDate(r.check_out)}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Footer */}
      <View style={s.cardFooter}>
        <View style={s.guestPriceCol}>
          <View style={s.guestRow}>
            <Text style={s.guestIcon}>👤</Text>
            <Text style={s.guestText}>
              {r.guests} guest{r.guests > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={s.totalPrice}>{formatCurrency(r.total_price)}</Text>
          <Text style={s.payNote}>Pay at hotel</Text>
        </View>

        {r.can_cancel && (
          <TouchableOpacity
            onPress={() => onCancel(r.id)}
            disabled={cancelling === r.id}
            style={[s.cancelBtn, cancelling === r.id && s.cancelBtnDisabled]}
            activeOpacity={0.75}
          >
            {cancelling === r.id ? (
              <ActivityIndicator size="small" color={Colors.danger} />
            ) : (
              <Text style={s.cancelBtnText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

export default function BookingsScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getMyReservationsApi();
      setReservations(data.results || data);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated]);

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
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
      ]
    );
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
    <View style={s.loaderContainer}>
      <ActivityIndicator size="large" color={Colors.blue} />
      <Text style={s.loaderText}>Loading your bookings…</Text>
    </View>
  );

  const upcoming = reservations.filter(r => ['confirmed', 'pending'].includes(r.status));
  const past = reservations.filter(r => !['confirmed', 'pending'].includes(r.status));

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerEyebrow}>MANAGE</Text>
        <Text style={s.headerTitle}>My Reservations</Text>
        {reservations.length > 0 && (
          <Text style={s.headerCount}>
            {reservations.length} booking{reservations.length > 1 ? 's' : ''} total
          </Text>
        )}
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
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.blue}
            />
          }
          ListHeaderComponent={
            upcoming.length > 0 && past.length > 0 ? (
              <Text style={s.sectionLabel}>Upcoming</Text>
            ) : null
          }
          renderItem={({ item: r, index }) => {
            const isFirstPast = past.length > 0 && upcoming.length > 0 && r.id === past[0].id;
            return (
              <>
                {isFirstPast && (
                  <Text style={[s.sectionLabel, { marginTop: 8 }]}>Past</Text>
                )}
                <ReservationCard
                  r={r}
                  cancelling={cancelling}
                  onCancel={handleCancel}
                />
              </>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  /* ── Header ── */
  header: {
    backgroundColor: Colors.navy,
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
  },

  /* ── Loader ── */
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: Colors.gray400,
  },

  /* ── List ── */
  listContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray400,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 2,
  },

  /* ── Card ── */
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 14,
  },
  cardHeaderLeft: {
    gap: 3,
  },
  bookingRef: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.blue,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  roomInfo: {
    fontSize: 12,
    color: Colors.gray400,
    textTransform: 'capitalize',
  },
  roomTypeDot: {
    color: Colors.gray400,
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginHorizontal: 16,
  },

  /* ── Dates ── */
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.gray50,
  },
  dateBlock: {
    flex: 1,
    gap: 3,
  },
  dateBlockRight: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.gray400,
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  nightsBadge: {
    alignItems: 'center',
    backgroundColor: Colors.navy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  nightsCount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 16,
  },
  nightsUnit: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* ── Footer ── */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 14,
  },
  guestPriceCol: {
    gap: 2,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  guestIcon: {
    fontSize: 11,
  },
  guestText: {
    fontSize: 11,
    color: Colors.gray400,
  },
  totalPrice: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.blue,
    letterSpacing: -0.3,
  },
  payNote: {
    fontSize: 10,
    color: Colors.gray400,
    marginTop: 1,
  },

  /* ── Cancel Button ── */
  cancelBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnDisabled: {
    opacity: 0.6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
});
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/utils/colors';
import { formatCurrency } from '../../src/utils/helpers';
import { getRoomApi } from '../../src/api';
import { Button, StatusBadge } from '../../src/components/UI';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const { isAuthenticated } = useAuth();
  const [room,       setRoom]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeImg,  setActiveImg]  = useState(0);

  useEffect(() => {
    getRoomApi(id).then(r => setRoom(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to book this room.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }
    router.push({ pathname: `/booking/${id}` });
  };

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
      <ActivityIndicator size="large" color={Colors.blue} />
    </View>
  );

  if (!room) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Room not found.</Text>
    </View>
  );

  const images = room.images || [];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={{ height: 280, backgroundColor: Colors.bluePale }}>
          {images.length > 0 ? (
            <>
              <Image source={{ uri: images[activeImg]?.image }} style={{ width, height: 280 }} />
              {images.length > 1 && (
                <View style={s.dots}>
                  {images.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setActiveImg(i)}>
                      <View style={[s.dot, i === activeImg && s.dotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 60, opacity: 0.2 }}>🏨</Text>
            </View>
          )}
          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: 24 }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.roomTitle}>Room {room.room_number}</Text>
              <Text style={s.roomSub}>
                {room.room_type?.name?.charAt(0).toUpperCase() + room.room_type?.name?.slice(1)} · Floor {room.floor}
              </Text>
            </View>
            <StatusBadge status={room.status} />
          </View>

          {/* Price */}
          <View style={s.priceBox}>
            <Text style={s.priceAmount}>{formatCurrency(room.room_type?.base_price)}</Text>
            <Text style={s.priceNight}>/night</Text>
          </View>

          {/* Info chips */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <View style={s.infoChip}>
              <Text style={s.infoChipText}>👥 Up to {room.room_type?.capacity} guests</Text>
            </View>
            <View style={s.infoChip}>
              <Text style={s.infoChipText}>🏢 Floor {room.floor}</Text>
            </View>
          </View>

          {/* Description */}
          {room.room_type?.description ? (
            <>
              <Text style={s.sectionHeading}>About This Room</Text>
              <Text style={s.description}>{room.room_type.description}</Text>
            </>
          ) : null}

          {/* Amenities */}
          {(room.room_type?.amenities || []).length > 0 && (
            <>
              <Text style={[s.sectionHeading, { marginTop: 20 }]}>Amenities</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {room.room_type.amenities.map(a => (
                  <View key={a} style={s.amenityTag}>
                    <Text style={s.amenityText}>✓ {a}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Notice */}
          <View style={s.notice}>
            <Text style={s.noticeText}>💳 Pay at hotel — no upfront payment required</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Book Button */}
      <View style={s.footer}>
        <View style={{ flex: 1 }}>
          <Text style={s.footerPrice}>{formatCurrency(room.room_type?.base_price)}</Text>
          <Text style={s.footerNight}>per night</Text>
        </View>
        <View style={{ flex: 2 }}>
          <Button
            title={room.status === 'available' ? 'Book This Room' : 'Unavailable'}
            variant="gold"
            onPress={handleBook}
            disabled={room.status !== 'available'}
          />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backBtn:      { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  dots:         { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:    { backgroundColor: Colors.white, width: 18 },
  roomTitle:    { fontSize: 24, fontWeight: '800', color: Colors.navy, letterSpacing: -0.5 },
  roomSub:      { fontSize: 13, color: Colors.gray400, marginTop: 3, textTransform: 'capitalize' },
  priceBox:     { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 16 },
  priceAmount:  { fontSize: 28, fontWeight: '800', color: Colors.blue },
  priceNight:   { fontSize: 14, color: Colors.gray400 },
  infoChip:     { backgroundColor: Colors.gray100, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  infoChipText: { fontSize: 13, color: Colors.gray600, fontWeight: '500' },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: Colors.navy },
  description:  { fontSize: 14, color: Colors.gray600, lineHeight: 22, marginTop: 8 },
  amenityTag:   { backgroundColor: Colors.bluePale, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  amenityText:  { fontSize: 13, color: Colors.blue, fontWeight: '500' },
  notice:       { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 10, padding: 12, marginTop: 20 },
  noticeText:   { fontSize: 13, color: '#92400e' },
  footer:       { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 32, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray100, gap: 16 },
  footerPrice:  { fontSize: 20, fontWeight: '800', color: Colors.navy },
  footerNight:  { fontSize: 12, color: Colors.gray400 },
});

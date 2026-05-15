import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/utils/colors';
import { formatCurrency } from '../../src/utils/helpers';
import { getRoomsApi, getRoomTypesApi } from '../../src/api';
import { Card, EmptyState } from '../../src/components/UI';

function RoomCard({ room, onPress }) {
  const price = room.room_type?.base_price;
  const img   = room.primary_image;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={{ marginBottom: 16 }}>
      <Card>
        <View style={s.imageBox}>
          {img
            ? <Image source={{ uri: img }} style={s.image} />
            : <View style={[s.image, s.imagePlaceholder]}>
                <Text style={{ fontSize: 36, opacity: 0.3 }}>🏨</Text>
              </View>
          }
          <View style={s.typeBadge}>
            <Text style={s.typeBadgeText}>{room.room_type?.name}</Text>
          </View>
          {room.status !== 'available' && (
            <View style={s.unavailableOverlay}>
              <Text style={{ color: Colors.white, fontWeight: '700', letterSpacing: 1 }}>UNAVAILABLE</Text>
            </View>
          )}
        </View>
        <View style={s.cardBody}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={s.roomNumber}>Room {room.room_number}</Text>
              <Text style={s.roomFloor}>Floor {room.floor} · Up to {room.room_type?.capacity} guests</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.price}>{formatCurrency(price)}</Text>
              <Text style={s.perNight}>per night</Text>
            </View>
          </View>
          {(room.room_type?.amenities || []).length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {room.room_type.amenities.slice(0, 3).map(a => (
                <View key={a} style={s.amenityTag}>
                  <Text style={s.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function RoomsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [rooms,     setRooms]     = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filter,    setFilter]    = useState(params.type || '');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getRoomsApi(), getRoomTypesApi()])
      .then(([r, t]) => {
        setRooms(r.data.results || r.data);
        setRoomTypes(t.data.results || t.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? rooms.filter(r => r.room_type?.name === filter) : rooms;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Rooms & Suites</Text>
        <Text style={s.headerSub}>Choose your perfect accommodation</Text>
      </View>

      {/* Filters */}
      <View style={s.filterRow}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, gap: 8, alignItems: 'center', height: 52 }}
  >
    <TouchableOpacity
      onPress={() => setFilter('')}
      style={[s.filterChip, filter === '' && s.filterChipActive]}
    >
      <Text style={[s.filterChipText, filter === '' && s.filterChipTextActive]}>All</Text>
    </TouchableOpacity>

    {roomTypes.map(type => (
      <TouchableOpacity
        key={type.name}
        onPress={() => setFilter(type.name)}
        style={[s.filterChip, filter === type.name && s.filterChipActive]}
      >
        <Text style={[s.filterChipText, filter === type.name && s.filterChipTextActive]}>
          {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏨" title="No Rooms Found" subtitle="Try a different filter." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onPress={() => router.push({ pathname: `/room/${item.id}` })}
            />
          )}
          contentContainerStyle={{ padding: 20, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header:           { backgroundColor: Colors.navy, paddingTop: 16, paddingBottom: 24, paddingHorizontal: 24 },
  headerTitle:      { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  headerSub:        { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  filterRow:        { backgroundColor: Colors.white, height: 52, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  filterChip:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99, backgroundColor: Colors.gray100, borderColor: 'transparent', alignSelf: 'center' },
  filterChipActive: { backgroundColor: Colors.bluePale, borderColor: Colors.blue },
  filterChipText:       { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  filterChipTextActive: { color: Colors.blue },
  imageBox:         { height: 200, backgroundColor: Colors.gray100, position: 'relative' },
  image:            { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bluePale },
  unavailableOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  typeBadge:        { position: 'absolute', top: 12, left: 12, backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  typeBadgeText:    { fontSize: 11, fontWeight: '700', color: Colors.navy, textTransform: 'capitalize' },
  cardBody:         { padding: 16 },
  roomNumber:       { fontSize: 17, fontWeight: '800', color: Colors.navy },
  roomFloor:        { fontSize: 12, color: Colors.gray400, marginTop: 2 },
  price:            { fontSize: 18, fontWeight: '800', color: Colors.blue },
  perNight:         { fontSize: 11, color: Colors.gray400 },
  amenityTag:       { backgroundColor: Colors.gray100, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  amenityText:      { fontSize: 11, color: Colors.gray600 },
});
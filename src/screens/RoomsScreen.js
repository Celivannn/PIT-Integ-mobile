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

const AMENITY_ICONS = {
  wifi: '📶', pool: '🏊', gym: '🏋️', spa: '🧖', breakfast: '🍳',
  parking: '🅿️', ac: '❄️', tv: '📺', minibar: '🍹', balcony: '🌅',
};

function amenityIcon(label = '') {
  const key = label.toLowerCase();
  return AMENITY_ICONS[key] || '✦';
}

function RoomCard({ room, onPress }) {
  const price = room.room_type?.base_price;
  const img = room.primary_image;
  const amenities = room.room_type?.amenities || [];
  const isAvailable = room.status === 'available';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.cardWrapper}>
      <Card style={s.card}>
        {/* Image */}
        <View style={s.imageBox}>
          {img
            ? <Image source={{ uri: img }} style={s.image} resizeMode="cover" />
            : <View style={[s.image, s.imagePlaceholder]}>
                <Text style={s.placeholderIcon}>🏨</Text>
              </View>
          }

          {/* Gradient-like overlay at bottom of image for badge legibility */}
          <View style={s.imageGradient} />

          {/* Type badge — bottom-left on image */}
          <View style={s.typeBadge}>
            <Text style={s.typeBadgeText}>{room.room_type?.name}</Text>
          </View>

          {/* Capacity badge — bottom-right on image */}
          <View style={s.capacityBadge}>
            <Text style={s.capacityText}>👤 {room.room_type?.capacity}</Text>
          </View>

          {/* Unavailable overlay */}
          {!isAvailable && (
            <View style={s.unavailableOverlay}>
              <Text style={s.unavailableText}>UNAVAILABLE</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={s.cardBody}>
          {/* Title + Price */}
          <View style={s.cardTopRow}>
            <View style={s.cardTitleCol}>
              <Text style={s.roomNumber}>Room {room.room_number}</Text>
              <Text style={s.roomFloor}>Floor {room.floor}</Text>
            </View>
            <View style={s.priceCol}>
              <Text style={s.price}>{formatCurrency(price)}</Text>
              <Text style={s.perNight}>/ night</Text>
            </View>
          </View>

          {/* Amenities */}
          {amenities.length > 0 && (
            <>
              <View style={s.divider} />
              <View style={s.amenitiesRow}>
                {amenities.slice(0, 4).map(a => (
                  <View key={a} style={s.amenityTag}>
                    <Text style={s.amenityIcon}>{amenityIcon(a)}</Text>
                    <Text style={s.amenityText}>{a}</Text>
                  </View>
                ))}
                {amenities.length > 4 && (
                  <View style={s.amenityMore}>
                    <Text style={s.amenityMoreText}>+{amenities.length - 4}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function RoomsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filter, setFilter] = useState(params.type || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRoomsApi(), getRoomTypesApi()])
      .then(([r, t]) => {
        setRooms(r.data.results || r.data);
        setRoomTypes(t.data.results || t.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? rooms.filter(r => r.room_type?.name === filter) : rooms;
  const availableCount = filtered.filter(r => r.status === 'available').length;

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerEyebrow}>EXPLORE</Text>
        <Text style={s.headerTitle}>Rooms & Suites</Text>
        {!loading && (
          <Text style={s.headerSub}>
            {availableCount} room{availableCount !== 1 ? 's' : ''} available
          </Text>
        )}
      </View>

      {/* Filter bar */}
      <View style={s.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterContent}
        >
          <TouchableOpacity
            onPress={() => setFilter('')}
            style={[s.filterChip, filter === '' && s.filterChipActive]}
          >
            <Text style={[s.filterChipText, filter === '' && s.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          {roomTypes.map(type => {
            const active = filter === type.name;
            return (
              <TouchableOpacity
                key={type.name}
                onPress={() => setFilter(type.name)}
                style={[s.filterChip, active && s.filterChipActive]}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={s.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.blue} />
          <Text style={s.loaderText}>Finding available rooms…</Text>
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
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
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
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
  },

  /* ── Filter bar ── */
  filterBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.bluePale,
    borderColor: Colors.blue,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray600,
  },
  filterChipTextActive: {
    color: Colors.blue,
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
    paddingTop: 16,
    paddingBottom: 36,
  },

  /* ── Card ── */
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 14,
  },
  imageBox: {
    height: 210,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bluePale,
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.25,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.navy,
    textTransform: 'capitalize',
  },
  capacityBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  capacityText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 13,
  },

  /* ── Card body ── */
  cardBody: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleCol: {
    gap: 3,
  },
  roomNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
  },
  roomFloor: {
    fontSize: 12,
    color: Colors.gray400,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.blue,
    letterSpacing: -0.3,
  },
  perNight: {
    fontSize: 11,
    color: Colors.gray400,
    marginTop: 1,
  },

  /* ── Amenities ── */
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginVertical: 12,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  amenityIcon: {
    fontSize: 11,
  },
  amenityText: {
    fontSize: 11,
    color: Colors.gray600,
    textTransform: 'capitalize',
  },
  amenityMore: {
    backgroundColor: Colors.bluePale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  amenityMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.blue,
  },
});
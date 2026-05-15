import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/utils/colors';
import { formatCurrency, getNights, getTodayStr, getTomorrowStr } from '../../src/utils/helpers';
import { checkAvailabilityApi } from '../../src/api';
import { Card, Button, EmptyState } from '../../src/components/UI';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [checkIn,  setCheckIn]  = useState(params.check_in  || getTodayStr());
  const [checkOut, setCheckOut] = useState(params.check_out || getTomorrowStr());
  const [type,     setType]     = useState(params.type || '');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const nights = getNights(checkIn, checkOut);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const p = { check_in: checkIn, check_out: checkOut };
      if (type) p.type = type;
      const { data } = await checkAvailabilityApi(p);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.check_in) handleSearch();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* Search form */}
      <View style={s.formBox}>
        <Text style={s.formTitle}>Find Available Rooms</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Check In</Text>
            <TextInput style={s.input} value={checkIn} onChangeText={setCheckIn} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.gray400} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Check Out</Text>
            <TextInput style={s.input} value={checkOut} onChangeText={setCheckOut} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.gray400} />
          </View>
        </View>
        <Text style={s.label}>Room Type (optional)</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {['', 'standard', 'deluxe', 'suite'].map(t => (
            <TouchableOpacity key={t || 'all'} onPress={() => setType(t)}
              style={[s.typeChip, type === t && s.typeChipActive]}>
              <Text style={[s.typeChipText, type === t && s.typeChipTextActive]}>
                {t || 'Any'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title={loading ? 'Searching...' : 'Search Rooms'} onPress={handleSearch} loading={loading} />
      </View>

      {/* Results */}
      {searched && !loading && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ fontSize: 13, color: Colors.gray600 }}>
            <Text style={{ fontWeight: '700', color: Colors.navy }}>{results.length}</Text>
            {' '}room{results.length !== 1 ? 's' : ''} available
            {nights > 0 ? ` · ${nights} night${nights > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Rooms Available"
          subtitle="Try different dates or room type."
          action={() => router.push('/rooms')}
          actionLabel="Browse All Rooms"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 14 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: room }) => {
            const total = Number(room.room_type?.base_price) * nights;
            return (
              <Card>
                <View style={{ height: 160, backgroundColor: Colors.bluePale }}>
                  {room.primary_image
                    ? <Image source={{ uri: room.primary_image }} style={{ width: '100%', height: '100%' }} />
                    : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 40, opacity: 0.2 }}>🏨</Text></View>
                  }
                  <View style={s.availBadge}>
                    <Text style={s.availBadgeText}>Available</Text>
                  </View>
                  <View style={s.typeLabel}>
                    <Text style={s.typeLabelText}>{room.room_type?.name}</Text>
                  </View>
                </View>
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={s.rNumber}>Room {room.room_number}</Text>
                      <Text style={s.rSub}>Floor {room.floor} · {room.room_type?.capacity} guests max</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: Colors.gray400 }}>
                        {formatCurrency(room.room_type?.base_price)}/night
                      </Text>
                      {nights > 0 && (
                        <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.blue }}>
                          {formatCurrency(total)} total
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={s.bookBtn}
                    onPress={() => router.push({ pathname: `/booking/${room.id}`, params: { check_in: checkIn, check_out: checkOut } })}
                    activeOpacity={0.85}
                  >
                    <Text style={s.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
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
  formBox:      { backgroundColor: Colors.navy, padding: 20, paddingTop: 16 },
  formTitle:    { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 14, letterSpacing: -0.3 },
  label:        { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 5 },
  input:        { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 11, color: Colors.white, fontSize: 14 },
  typeChip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  typeChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  typeChipText:       { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize' },
  typeChipTextActive: { color: Colors.navy },
  availBadge:   { position: 'absolute', top: 10, right: 10, backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  availBadgeText: { fontSize: 10, fontWeight: '700', color: '#065f46' },
  typeLabel:    { position: 'absolute', top: 10, left: 10, backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  typeLabelText: { fontSize: 10, fontWeight: '700', color: Colors.navy, textTransform: 'capitalize' },
  rNumber:      { fontSize: 15, fontWeight: '800', color: Colors.navy },
  rSub:         { fontSize: 11, color: Colors.gray400, marginTop: 2 },
  bookBtn:      { backgroundColor: Colors.blue, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  bookBtnText:  { color: Colors.white, fontWeight: '700', fontSize: 14 },
});

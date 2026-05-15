import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/utils/colors';
import { getTodayStr, getTomorrowStr, formatCurrency } from '../../src/utils/helpers';
import { getRoomTypesApi } from '../../src/api';
import { Card } from '../../src/components/UI';

const { width } = Dimensions.get('window');

function QuickSearch() {
  const router = useRouter();
  const [checkIn,  setCheckIn]  = useState(getTodayStr());
  const [checkOut, setCheckOut] = useState(getTomorrowStr());

  const handleSearch = () => {
    router.push({ pathname: '/search', params: { check_in: checkIn, check_out: checkOut } });
  };

  return (
    <Card style={{ margin: 20, marginTop: -28, padding: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.navy, marginBottom: 14, letterSpacing: 0.3 }}>
        CHECK AVAILABILITY
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>Check In</Text>
          <TextInput
            style={s.dateInput}
            value={checkIn}
            onChangeText={setCheckIn}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.gray400}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>Check Out</Text>
          <TextInput
            style={s.dateInput}
            value={checkOut}
            onChangeText={setCheckOut}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.gray400}
          />
        </View>
      </View>
      <TouchableOpacity style={s.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
        <Text style={s.searchBtnText}>Search Available Rooms</Text>
      </TouchableOpacity>
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    getRoomTypesApi().then(r => setRoomTypes(r.data.results || r.data)).catch(() => {});
  }, []);

  const typeInfo = {
    standard: { emoji: '🛏️', color: '#dbeafe', accent: Colors.blue,    desc: 'Comfortable & well-appointed' },
    deluxe:   { emoji: '✨', color: '#fef3c7', accent: '#92400e',       desc: 'Premium & spacious' },
    suite:    { emoji: '👑', color: '#f0fdf4', accent: '#065f46',       desc: 'Ultimate luxury' },
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.cream }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['#0a1e3d', '#0f2b4c', '#1a3a5c']}
        style={s.hero}
      >
        <View style={s.heroDecor1} />
        <View style={s.heroDecor2} />
        <View style={s.heroContent}>
          <Text style={s.heroTagline}>WELCOME TO</Text>
          <Text style={s.heroTitle}>Grand Azure</Text>
          <Text style={s.heroSub}>Hotel & Resort</Text>
          <Text style={s.heroDesc}>
            Experience luxury and comfort in the heart of Cagayan de Oro.
          </Text>
          <TouchableOpacity
            style={s.heroBtn}
            onPress={() => router.push('/rooms')}
            activeOpacity={0.85}
          >
            <Text style={s.heroBtnText}>Browse Rooms</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Search */}
      <QuickSearch />

      {/* Features */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <Text style={s.sectionLabel}>WHY CHOOSE US</Text>
        <Text style={s.sectionTitle}>The Grand Azure{'\n'}Experience</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
          {[
            { icon: '🌊', title: 'Scenic Views',   desc: 'Breathtaking vistas' },
            { icon: '🍽️', title: 'Fine Dining',    desc: 'World-class cuisine' },
            { icon: '🏊', title: 'Infinity Pool',  desc: 'Rooftop experience' },
            { icon: '🔒', title: 'Secure Booking', desc: 'Guaranteed stay' },
            { icon: '💳', title: 'Pay at Hotel',   desc: 'No upfront cost' },
          ].map(({ icon, title, desc }) => (
            <Card key={title} style={{ padding: 16, marginRight: 12, width: 130, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>{icon}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.navy, textAlign: 'center', marginBottom: 4 }}>{title}</Text>
              <Text style={{ fontSize: 11, color: Colors.gray400, textAlign: 'center' }}>{desc}</Text>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Room Types */}
      <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
        <Text style={s.sectionLabel}>ACCOMMODATIONS</Text>
        <Text style={s.sectionTitle}>Our Room Categories</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          {roomTypes.map(rt => {
            const info = typeInfo[rt.name] || typeInfo.standard;
            return (
              <TouchableOpacity
                key={rt.id}
                onPress={() => router.push({ pathname: '/rooms', params: { type: rt.name } })}
                activeOpacity={0.88}
              >
                <Card style={{ flexDirection: 'row', overflow: 'hidden' }}>
                  <View style={{ width: 80, backgroundColor: info.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 32 }}>{info.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.navy, textTransform: 'capitalize' }}>
                        {rt.name} Room
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.blue }}>
                        {formatCurrency(rt.base_price)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: Colors.gray400, marginTop: 2 }}>/night</Text>
                    <Text style={{ fontSize: 13, color: Colors.gray600, marginTop: 6 }}>{info.desc}</Text>
                    <Text style={{ fontSize: 11, color: Colors.gray400, marginTop: 4 }}>
                      Up to {rt.capacity} guests
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero:       { minHeight: 360, paddingTop: 60, paddingBottom: 60, paddingHorizontal: 24, justifyContent: 'flex-end', overflow: 'hidden' },
  heroDecor1: { position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(201,168,76,0.06)' },
  heroDecor2: { position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(30,95,168,0.1)' },
  heroContent: { zIndex: 1 },
  heroTagline: { fontSize: 11, letterSpacing: 3, color: Colors.gold, fontWeight: '700', marginBottom: 8 },
  heroTitle:   { fontSize: 44, fontWeight: '800', color: Colors.white, letterSpacing: -1, lineHeight: 48 },
  heroSub:     { fontSize: 14, letterSpacing: 2, color: Colors.goldLight, marginBottom: 14, fontWeight: '500' },
  heroDesc:    { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 22, marginBottom: 24, maxWidth: 280 },
  heroBtn:     { backgroundColor: Colors.gold, paddingVertical: 13, paddingHorizontal: 28, borderRadius: 12, alignSelf: 'flex-start' },
  heroBtnText: { color: Colors.navy, fontWeight: '700', fontSize: 14 },
  inputLabel:  { fontSize: 11, fontWeight: '600', color: Colors.gray600, marginBottom: 5 },
  dateInput:   { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: 10, padding: 11, fontSize: 14, color: Colors.gray800 },
  searchBtn:   { backgroundColor: Colors.blue, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  searchBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  sectionLabel: { fontSize: 11, letterSpacing: 2.5, color: Colors.blue, fontWeight: '700', marginBottom: 6 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: Colors.navy, letterSpacing: -0.5, lineHeight: 30 },
});

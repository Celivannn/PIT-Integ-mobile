import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform, Dimensions, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/utils/colors';
import { getTodayStr, getTomorrowStr, formatCurrency } from '../../src/utils/helpers';
import { getRoomTypesApi } from '../../src/api';
import { Card } from '../../src/components/UI';

const { width, height } = Dimensions.get('window');

// Animated Card Component
const AnimatedCard = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Enhanced Quick Search Component
function QuickSearch() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(getTodayStr());
  const [checkOut, setCheckOut] = useState(getTomorrowStr());
  const [isFocusedIn, setIsFocusedIn] = useState(false);
  const [isFocusedOut, setIsFocusedOut] = useState(false);

  const handleSearch = () => {
    if (checkIn && checkOut) {
      router.push({ pathname: '/search', params: { check_in: checkIn, check_out: checkOut } });
    }
  };

  return (
    <AnimatedCard delay={200} style={s.searchContainer}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={s.searchCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.searchHeader}>
          <View style={s.searchBadge}>
            <Text style={s.searchBadgeText}>SPECIAL OFFER</Text>
          </View>
          <Text style={s.searchTitle}>Book Your Stay</Text>
          <Text style={s.searchSubtitle}>Best price guaranteed</Text>
        </View>

        <View style={s.dateRow}>
          <View style={[s.dateField, isFocusedIn && s.dateFieldFocused]}>
            <Text style={s.fieldLabel}>CHECK-IN</Text>
            <TextInput
              style={s.dateInput}
              value={checkIn}
              onChangeText={setCheckIn}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.gray400}
              onFocus={() => setIsFocusedIn(true)}
              onBlur={() => setIsFocusedIn(false)}
            />
          </View>
          <View style={s.dateSeparator}>
            <Text style={s.separatorText}>→</Text>
          </View>
          <View style={[s.dateField, isFocusedOut && s.dateFieldFocused]}>
            <Text style={s.fieldLabel}>CHECK-OUT</Text>
            <TextInput
              style={s.dateInput}
              value={checkOut}
              onChangeText={setCheckOut}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.gray400}
              onFocus={() => setIsFocusedOut(true)}
              onBlur={() => setIsFocusedOut(false)}
            />
          </View>
        </View>

        <TouchableOpacity style={s.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.blue, '#1e5fa8']}
            style={s.searchBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={s.searchBtnText}>Check Availability</Text>
            <Text style={s.searchBtnIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </AnimatedCard>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, desc, index }) => (
  <AnimatedCard delay={300 + index * 50} style={s.featureCard}>
    <View style={s.featureIconContainer}>
      <Text style={s.featureIcon}>{icon}</Text>
    </View>
    <Text style={s.featureTitle}>{title}</Text>
    <Text style={s.featureDesc}>{desc}</Text>
  </AnimatedCard>
);

// Room Card Component - IMPROVED
const RoomCard = ({ room, info, onPress }) => (
  <AnimatedCard delay={400} style={s.roomCard}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
      <View style={s.roomCardInner}>
        <View style={[s.roomEmojiContainer, { backgroundColor: info.color }]}>
          <Text style={s.roomEmoji}>{info.emoji}</Text>
        </View>
        <View style={s.roomDetails}>
          <View style={s.roomHeader}>
            <View style={s.roomTitleSection}>
              <Text style={s.roomName}>{room.name} Room</Text>
              <View style={s.roomBadge}>
                <Text style={s.roomBadgeText}>{room.capacity} Guests</Text>
              </View>
            </View>
            <View style={s.priceContainer}>
              <Text style={s.priceAmount}>{formatCurrency(room.base_price)}</Text>
              <Text style={s.pricePeriod}>/night</Text>
            </View>
          </View>
          
          <Text style={s.roomDesc}>{info.desc}</Text>
          
          <View style={s.roomFeatures}>
            <View style={s.featureItem}>
              <Text style={s.featureItemIcon}>🛏️</Text>
              <Text style={s.featureItemText}>{room.bed_type || 'Queen Bed'}</Text>
            </View>
            <View style={s.featureDivider} />
            <View style={s.featureItem}>
              <Text style={s.featureItemIcon}>📏</Text>
              <Text style={s.featureItemText}>{room.size || '32m²'}</Text>
            </View>
            <View style={s.featureDivider} />
            <View style={s.featureItem}>
              <Text style={s.featureItemIcon}>🪟</Text>
              <Text style={s.featureItemText}>{room.view || 'City View'}</Text>
            </View>
          </View>
          
          <View style={s.roomFooter}>
            <View style={s.amenities}>
              <Text style={s.amenity}>✓ Free WiFi</Text>
              <Text style={s.amenity}>✓ AC</Text>
              <Text style={s.amenity}>✓ TV</Text>
            </View>
            <View style={s.bookButton}>
              <Text style={s.bookButtonText}>Book Now →</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </AnimatedCard>
);

export default function HomeScreen() {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getRoomTypesApi()
      .then(r => setRoomTypes(r.data.results || r.data))
      .catch(() => console.log('Failed to load rooms'));
  }, []);

  const typeInfo = {
    standard: { 
      emoji: '🛏️', 
      color: '#EBF5FF', 
      accent: Colors.blue, 
      desc: 'Comfortable & well-appointed with modern amenities including a work desk and premium bedding.' 
    },
    deluxe: { 
      emoji: '✨', 
      color: '#FEF3C7', 
      accent: '#92400e', 
      desc: 'Premium & spacious with panoramic views, separate living area, and upgraded amenities.' 
    },
    suite: { 
      emoji: '👑', 
      color: '#ECFDF5', 
      accent: '#065f46', 
      desc: 'Ultimate luxury with private lounge access, butler service, and breathtaking ocean views.' 
    },
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.View style={[s.headerBar, { opacity: headerOpacity }]}>
        <Text style={s.headerTitle}>Grand Azure</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarText}>👤</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#0a1e3d', '#0f2b4c', '#1a3a5c']}
          style={s.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.heroDecor1} />
          <View style={s.heroDecor2} />
          <View style={s.heroContent}>
            <AnimatedCard delay={0}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>★★★★★ 5 STAR LUXURY</Text>
              </View>
              <Text style={s.heroTitle}>Grand Azure</Text>
              <Text style={s.heroSubtitle}>Hotel & Resort</Text>
              <Text style={s.heroDesc}>
                Experience unparalleled luxury and comfort in the heart of Cagayan de Oro.
                Where every stay becomes a cherished memory.
              </Text>
              <TouchableOpacity
                style={s.heroBtn}
                onPress={() => router.push('/rooms')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.gold, '#c9a84c']}
                  style={s.heroBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={s.heroBtnText}>Explore Our Rooms</Text>
                </LinearGradient>
              </TouchableOpacity>
            </AnimatedCard>
          </View>
        </LinearGradient>

        {/* Quick Search */}
        <QuickSearch />

        {/* Features Section */}
        <View style={s.section}>
          <AnimatedCard delay={100}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>AMENITIES</Text>
              <Text style={s.sectionTitle}>World-Class Facilities</Text>
            </View>
          </AnimatedCard>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={s.featuresScroll}
            contentContainerStyle={s.featuresContainer}
          >
            {[
              { icon: '🌊', title: 'Ocean Views', desc: 'Breathtaking sea vistas from every room' },
              { icon: '🍽️', title: 'Fine Dining', desc: 'Michelin-starred culinary experience' },
              { icon: '🏊', title: 'Infinity Pool', desc: 'Rooftop pool with panoramic views' },
              { icon: '💆', title: 'Spa & Wellness', desc: 'Rejuvenating treatments & massages' },
              { icon: '🔒', title: 'Secure Booking', desc: '100% safe & guaranteed' },
            ].map((item, idx) => (
              <FeatureCard key={item.title} {...item} index={idx} />
            ))}
          </ScrollView>
        </View>

        {/* Room Types Section - IMPROVED */}
        <View style={[s.accommodationsSection]}>
          <AnimatedCard delay={200}>
            <View style={s.accommodationsHeader}>
              <Text style={s.sectionLabel}>ACCOMMODATIONS</Text>
              <Text style={s.sectionTitle}>Luxurious Rooms & Suites</Text>
              <Text style={s.sectionDesc}>
                Choose from our carefully curated selection of premium accommodations
              </Text>
            </View>
          </AnimatedCard>

          <View style={s.roomsGrid}>
            {roomTypes.map((room, idx) => (
              <RoomCard
                key={room.id}
                room={room}
                info={typeInfo[room.name?.toLowerCase()] || typeInfo.standard}
                onPress={() => router.push({ pathname: '/rooms', params: { type: room.name } })}
              />
            ))}
          </View>
        </View>

        {/* Call to Action Banner */}
        <AnimatedCard delay={500}>
          <LinearGradient
            colors={['#0f2b4c', '#1a3a5c']}
            style={s.ctaBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={s.ctaTitle}>Ready for an Unforgettable Stay?</Text>
            <Text style={s.ctaDesc}>Book directly and get exclusive perks & upgrades</Text>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => router.push('/booking')}
              activeOpacity={0.85}
            >
              <Text style={s.ctaBtnText}>Book Now →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </AnimatedCard>

        {/* Footer Spacer */}
        <View style={s.footerSpacer} />
      </Animated.ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#0a1e3d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
  },
  hero: {
    minHeight: height * 0.55,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(30,95,168,0.12)',
  },
  heroContent: {
    zIndex: 1,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
    lineHeight: 52,
  },
  heroSubtitle: {
    fontSize: 16,
    letterSpacing: 3,
    color: Colors.goldLight,
    marginBottom: 16,
    fontWeight: '500',
  },
  heroDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 12,
  },
  heroBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  heroBtnText: {
    color: Colors.navy,
    fontWeight: '700',
    fontSize: 14,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  searchCard: {
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBadge: {
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 1,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
  },
  searchSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  dateFieldFocused: {
    borderColor: Colors.blue,
    borderWidth: 2,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gray500,
    marginBottom: 6,
    letterSpacing: 1,
  },
  dateInput: {
    fontSize: 14,
    color: Colors.gray800,
    padding: 0,
  },
  dateSeparator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorText: {
    fontSize: 20,
    color: Colors.blue,
    fontWeight: '600',
  },
  searchBtn: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  searchBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  searchBtnIcon: {
    color: Colors.white,
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  accommodationsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
    backgroundColor: Colors.cream,
  },
  accommodationsHeader: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: Colors.blue,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 8,
    lineHeight: 20,
  },
  featuresScroll: {
    marginHorizontal: -20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: 140,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 11,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 15,
  },
  roomsGrid: {
    gap: 20,
  },
  roomCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  roomCardInner: {
    flexDirection: 'row',
  },
  roomEmojiContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  roomEmoji: {
    fontSize: 48,
  },
  roomDetails: {
    flex: 1,
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  roomBadge: {
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roomBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gold,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.blue,
  },
  pricePeriod: {
    fontSize: 10,
    color: Colors.gray500,
  },
  roomDesc: {
    fontSize: 13,
    color: Colors.gray600,
    marginBottom: 14,
    lineHeight: 18,
  },
  roomFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray200,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  featureItemIcon: {
    fontSize: 14,
  },
  featureItemText: {
    fontSize: 11,
    color: Colors.gray600,
    fontWeight: '500',
  },
  featureDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.gray300,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenities: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  amenity: {
    fontSize: 11,
    color: Colors.gray600,
  },
  bookButton: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  ctaBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaBtnText: {
    color: Colors.navy,
    fontWeight: '700',
    fontSize: 14,
  },
  footerSpacer: {
    height: 40,
  },
});
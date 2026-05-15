import { SafeAreaView } from 'react-native-safe-area-context';
import BookingScreen from '../../src/screens/BookingScreen';

export default function BookingRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <BookingScreen />
    </SafeAreaView>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';
import BookingsScreen from '../../src/screens/BookingsScreen';

export default function BookingsTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <BookingsScreen />
    </SafeAreaView>
  );
}

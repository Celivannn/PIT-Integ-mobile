import { SafeAreaView } from 'react-native-safe-area-context';
import RoomDetailScreen from '../../src/screens/RoomDetailScreen';

export default function RoomDetailRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <RoomDetailScreen />
    </SafeAreaView>
  );
}

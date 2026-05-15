import { SafeAreaView } from 'react-native-safe-area-context';
import RoomsScreen from '../../src/screens/RoomsScreen';

export default function RoomsTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <RoomsScreen />
    </SafeAreaView>
  );
}

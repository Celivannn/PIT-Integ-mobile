import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../../src/screens/HomeScreen';

export default function HomeTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <HomeScreen />
    </SafeAreaView>
  );
}

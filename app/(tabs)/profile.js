import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreen from '../../src/screens/ProfileScreen';

export default function ProfileTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ProfileScreen />
    </SafeAreaView>
  );
}

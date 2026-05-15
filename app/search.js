import { SafeAreaView } from 'react-native-safe-area-context';
import SearchScreen from '../src/screens/SearchScreen';

export default function SearchRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <SearchScreen />
    </SafeAreaView>
  );
}

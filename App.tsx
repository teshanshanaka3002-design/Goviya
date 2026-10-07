import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/services/store';
import { AppHeader } from './src/components/shared/AppHeader';
import { BottomNav } from './src/components/ui/BottomNav';
import { AuthScreen } from './src/screens/auth/AuthScreens';
import { BuyerScreens } from './src/screens/buyer/BuyerScreens';
import { FarmerScreens } from './src/screens/farmer/FarmerScreens';
import { DriverScreens } from './src/screens/driver/DriverScreens';
import { AdminScreens } from './src/screens/admin/AdminScreens';

const MainNavigator: React.FC = () => {
  const { currentUser, currentRole, navState } = useApp();

  const isSubScreenActive = Boolean(navState.subScreen);

  // Non-buyer dashboards require sign in / sign up
  const requiresRoleAuth =
    currentRole !== 'buyer' && (!currentUser || currentUser.role !== currentRole);

  const renderRoleScreen = () => {
    if (requiresRoleAuth) {
      return <AuthScreen initialRole={currentRole} />;
    }
    if (navState.subScreen === 'auth') {
      return <AuthScreen initialRole={navState.authRole} initialView={navState.authView} />;
    }

    switch (currentRole) {
      case 'buyer':
        return <BuyerScreens />;
      case 'farmer':
        return <FarmerScreens />;
      case 'driver':
        return <DriverScreens />;
      case 'admin':
        return <AdminScreens />;
      default:
        return <BuyerScreens />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.content}>
          {renderRoleScreen()}
        </View>
        {!isSubScreenActive && !requiresRoleAuth && <BottomNav role={currentRole} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F7F5',
  },
  content: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

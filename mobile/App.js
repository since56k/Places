import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import FeedScreen from './src/screens/FeedScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import AddScreen from './src/screens/AddScreen';
import MyPlacesScreen from './src/screens/MyPlacesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PlaceDetailsScreen from './src/screens/PlaceDetailsScreen';
import { PlacesProvider } from './src/context/PlacesContext';
import { colors, typography } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const icons = {
  Feed: ['home-outline', 'home'],
  Explore: ['search-outline', 'search'],
  Add: ['add', 'add'],
  'My Places': ['bookmark-outline', 'bookmark'],
  Profile: ['person-outline', 'person'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: route.name === 'Add' ? colors.accent : colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Add') {
            return (
              <View
                style={{
                  width: 38,
                  height: 38,
                  marginTop: -4,
                  borderRadius: 19,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused ? colors.accent : colors.accentSoft,
                }}
              >
                <Ionicons name="add" color={focused ? colors.surface : colors.accent} size={24} />
              </View>
            );
          }

          return (
            <Ionicons
              name={icons[route.name][focused ? 1 : 0]}
              color={color}
              size={23}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="My Places" component={MyPlacesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <PlacesProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PlacesProvider>
  );
}

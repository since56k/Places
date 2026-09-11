import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from './src/screens/FeedScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import AddScreen from './src/screens/AddScreen';
import MyPlacesScreen from './src/screens/MyPlacesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const icons = {
  Feed: ['home-outline', 'home'],
  Explore: ['search-outline', 'search'],
  Add: ['add-circle-outline', 'add-circle'],
  'My Places': ['bookmark-outline', 'bookmark'],
  Profile: ['person-outline', 'person'],
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.background },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={icons[route.name][focused ? 1 : 0]} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Add" component={AddScreen} />
        <Tab.Screen name="My Places" component={MyPlacesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

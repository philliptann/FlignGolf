// AppNavigator.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View,Pressable, Text } from "react-native";

import AboutScreen from "../screens/AboutScreen";
import RulesScreen from "../screens/RulesScreen";
import CoursesScreen from "../screens/CoursesScreen";
import CourseDetailScreen from "../screens/CourseDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { contentStyles as styles } from "../styles/contentStyles";
import HomeHeaderTitle from "../components/HomeHeaderTitle";

import { useAuth } from "../auth/AuthContext";

const Tab = createBottomTabNavigator();
const CoursesStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function CoursesStackScreen() {
  return (
    <CoursesStack.Navigator>
      <CoursesStack.Screen
        name="CoursesList"
        component={CoursesScreen}
        options={{ title: "Courses", headerRight: () => <LogoutButton />, }}
      />
      <CoursesStack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: "Course Details" }}
      />
    </CoursesStack.Navigator>
  );
}

function Auth() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
    </AuthStack.Navigator>
  );
}

function LogoutButton() {
  const { logout, authBusy } = useAuth();

  return (
    <Pressable
      onPress={logout}
      disabled={authBusy}
      style={{ marginRight: 16, opacity: authBusy ? 0.5 : 1 }}
    >
       <Text style={styles.logoutText}>Log out</Text>
    </Pressable>
  );
}



export default function AppNavigator() {
  const { user, booting } = useAuth(); // ✅ use booting now

  if (booting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            //headerShown: route.name === "About", // ✅ only About shows header
            tabBarIcon: ({ color, size }) => {
              const icon =
                route.name === "About"
                  ? "home-outline"
                  : route.name === "Rules"
                  ? "list-outline"
                  : route.name === "Courses"
                  ? "map-outline"
                  : "person-outline";

              return <Ionicons name={icon as any} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="About"
            component={AboutScreen}
            options={{
              headerShown: true,
              headerTitle: () => <HomeHeaderTitle />,
              headerRight: () => <LogoutButton />,
            }}
          />
          <Tab.Screen
            name="Rules"
            component={RulesScreen}
            options={{
              headerShown: true,
              title: "Rules",
              headerRight: () => <LogoutButton />,
            }}
          />
          <Tab.Screen
              name="Courses"
              component={CoursesStackScreen}
              options={{
                headerShown:false,
              }}
            />
          <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: "Profile",
                headerRight: () => <LogoutButton />,
              }}
            />
        </Tab.Navigator>
      ) : ( <Auth />  )}
    </NavigationContainer>
  );
}

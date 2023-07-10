import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../screens/AuthScreen";
import OtpScreen from "../screens/OtpScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";

const Stack = createNativeStackNavigator();

const AuthNavigator = (props: any) => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Home"
                component={AuthScreen}
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen 
                name="Otp"
                component={OtpScreen}
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen 
                name="CreateAccount"
                component={CreateAccountScreen}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
}

export default AuthNavigator;
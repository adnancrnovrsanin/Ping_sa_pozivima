import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/store';
import StartUpScreen from '../screens/StartUpScreen';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';

const AppNavigator = () => {
    const isAuth = useSelector((state: RootState) => state.auth.token !== null && state.auth.token !== undefined);
    const didTryAutoLogin = useSelector((state: RootState) => state.auth.didTryAutoLogin);

    return (
        <NavigationContainer>
            {isAuth && <MainNavigator />}
            {!isAuth && didTryAutoLogin && <AuthNavigator />}
            {!isAuth && !didTryAutoLogin && <StartUpScreen />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({

});

export default AppNavigator;
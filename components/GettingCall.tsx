import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from './Button';
import colors from '../constants/colors';

interface Props {
    hangup?: () => void;
    join?: () => void;
}

export default function GettingCall(props: Props) {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>You are getting a call...</Text>
        <View style={styles.bContainer}>
            <Button onPress={props.join} iconName="phone" backgroundColor="#00FF00" style={{ marginRight: 30 }} />
            <Button onPress={props.hangup} iconName="phone-slash" backgroundColor="#FF0000" style={{ marginLeft: 30 }} />
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: colors.pink
    },
    bContainer: {
        width: "75%",
        flexDirection: "row",
        justifyContent: "space-between",
        bottom: 30
    },
    text: {
        fontSize: 30,
        color: "white",
        marginBottom: 30,
        bottom: 500
    }
})
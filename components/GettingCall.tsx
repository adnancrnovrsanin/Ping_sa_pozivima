import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from './Button';

interface Props {
    hangup?: () => void;
    join?: () => void;
}

export default function GettingCall(props: Props) {
  return (
    <View style={styles.container}>
        <Image source={require('../assets/images/gettingCall.jpg')} style={styles.image} />
        <View style={styles.bContainer}>
            <Button onPress={props.hangup} iconName="phone-slash" backgroundColor="#FF0000" style={{ marginRight: 30 }} />
            <Button onPress={props.join} iconName="phone" backgroundColor="#00FF00" style={{ marginLeft: 30 }} />
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    image: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    bContainer: {
        flexDirection: "row",
        bottom: 30
    }
})
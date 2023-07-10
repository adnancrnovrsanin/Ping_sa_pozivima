import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';
import { AntDesign } from '@expo/vector-icons';
import { MessageType } from '../models/Message';

const ReplyTo = (props: any) => {
    const { text, name, onCancel, type } = props;

    const getText = () => {
        if (type === MessageType.IMAGE)
            return "Photo";
        return text;
    }

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.name}>
                    {name}
                </Text>
                <Text numberOfLines={1}>
                    {getText()}
                </Text>
            </View>

            <TouchableOpacity onPress={onCancel}>
                <AntDesign name="closecircleo" size={24} color={colors.blue} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.extraLightGrey,
        padding: 8,
        flexDirection: "row",
        alignItems: "center",
        borderLeftColor: colors.blue,
        borderLeftWidth: 4,
    },
    textContainer: {
        flex: 1,
        marginRight: 5,
    },
    name: {
        color: colors.blue,
        fontFamily: "medium",
        letterSpacing: 0.3,
    }
});

export default ReplyTo; 
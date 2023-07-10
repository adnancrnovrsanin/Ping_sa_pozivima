import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
    onPress?: () => any;
    iconName: string;
    backgroundColor: string;
    style?: any;
}

const Button = (props: Props) => {
    return (
        <View>
            <TouchableOpacity
                onPress={props.onPress}
                style={[
                    { backgroundColor: props.backgroundColor },
                    props.style,
                    styles.button
                ]}
            >
                <FontAwesome5 name={props.iconName} size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 60,
        height: 60,
        padding: 10,
        elevation: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 100,
    }
});

export default Button;
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { MenuOption } from "react-native-popup-menu";

const CustomMenuItem = (props: any) => {

    const Icon = props.iconPack ?? Feather;

    return (
        <MenuOption onSelect={props.onSelect}>
            <View style={styles.menuItemContainer}>
                <Text style={styles.menuText}>{props.text}</Text>
                <Icon name={props.icon} size={20} />
            </View>
        </MenuOption>
    );
}

const styles = StyleSheet.create({
    menuItemContainer: {
        flexDirection: "row",
        padding: 5
    },
    menuText: {
        flex: 1,
        fontFamily: "regular",
        letterSpacing: 0.3,
        fontSize: 16,
    }
});

export default CustomMenuItem;
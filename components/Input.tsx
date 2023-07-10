import { StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../constants/colors";
import { useField } from "formik";

const Input = (props: any) => {
    const [field, meta] = useField(props.name);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{props.label}</Text>

            <View style={styles.inputContainer}>
                {props.icon && <props.iconPack name={props.icon} size={props.iconSize || 15} style={styles.icon} />}
                <TextInput {...props} {...field} style={styles.input} onChangeText={text => props.onChange(text)} />
            </View>

            {
                meta.touched && meta.error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{meta.error}</Text>
                    </View>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    label: {
        marginVertical: 8,
        fontFamily: "bold",
        letterSpacing: 0.3,
        color: colors.textColor,
    },
    inputContainer: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: colors.nearlyWhite,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 2,
        alignItems: "center",
    },
    icon: {
        marginRight: 10,
        color: colors.grey,
    },
    input: {
        color: colors.textColor,
        flex: 1,
        fontFamily: "regular",
        letterSpacing: 0.3,
        paddingTop: 0,
    },
    errorContainer: {
        marginVertical: 5,
    },
    errorText: {
        color: colors.error,
        fontFamily: "regular",
        fontSize: 13,
        letterSpacing: 0.3,
    },
});

export default Input;
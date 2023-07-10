import { TouchableWithoutFeedback, View, Text, StyleSheet, TouchableNativeFeedback, Dimensions, Platform, TouchableOpacity } from "react-native";
import ProfileImage from "./ProfileImage";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";

const imageSize = 40;

const DataItem = (props: any) => {
    const { title, subTitle } = props;

    const image = props.image ? props.image : null;
    const icon = props.icon ? props.icon : null;
    const isChecked = props.isChecked ? props.isChecked : false;
    const type = props.type ? props.type : null;
    
    // console.log("DataItem: ", props);

    const hideImage = props?.hideImage && props.hideImage === true;
    const onPress = props?.onPress ? props.onPress : null;

    if (onPress === null) {
        return (
            <View>
                <View style={styles.container}>
                    {
                        !icon && !hideImage && (
                            <ProfileImage 
                                uri={image}
                                size={imageSize}
                                title={title}
                            />
                        )
                    }

                    {
                        icon && !hideImage && (
                            <View style={styles.leftIconContainer}>
                                <AntDesign name={icon} size={20} color={colors.blue} />
                            </View>
                        )
                    }
                    <View style={styles.textContainer}>
                        <Text
                            numberOfLines={1}
                            style={{ color: type === "button" ? colors.blue : colors.textColor, ...styles.title }}
                        >
                            {title}
                        </Text>

                        {
                            subTitle && (
                                <Text
                                    numberOfLines={1}
                                    style={styles.subTitle}
                                >
                                    {subTitle}
                                </Text>
                            )
                        }
                    </View>

                    {
                        type === "checkbox" && (
                            <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                                <Ionicons name="checkmark" size={18} color="white" />
                            </View>
                        )
                    }

                    {       
                        type === "link" && (
                            <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                                <Ionicons name="chevron-forward-outline" size={24} color="black" />
                            </View>
                        )
                    }
                </View>
            </View>
        );
    }

    if (Platform.OS === "ios") {
        return (
            <TouchableOpacity onPress={onPress}>
                <View style={styles.container}>
                    {
                        !icon && !hideImage && (
                            <ProfileImage 
                                uri={image}
                                size={imageSize}
                                title={title}
                            />
                        )
                    }

                    {
                        icon && !hideImage && (
                            <View style={styles.leftIconContainer}>
                                <AntDesign name={icon} size={20} color={colors.blue} />
                            </View>
                        )
                    }
                    <View style={styles.textContainer}>
                        <Text
                            numberOfLines={1}
                            style={{ color: type === "button" ? colors.blue : colors.textColor, ...styles.title }}
                        >
                            {title}
                        </Text>

                        {
                            subTitle && (
                                <Text
                                    numberOfLines={1}
                                    style={styles.subTitle}
                                >
                                    {subTitle}
                                </Text>
                            )
                        }
                    </View>

                    {
                        type === "checkbox" && (
                            <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                                <Ionicons name="checkmark" size={18} color="white" />
                            </View>
                        )
                    }

                    {       
                        type === "link" && (
                            <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                                <Ionicons name="chevron-forward-outline" size={24} color="black" />
                            </View>
                        )
                    }
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableNativeFeedback onPress={onPress}>
            <View style={styles.container}>
                {
                    !icon && !hideImage && (
                        <ProfileImage 
                            uri={image}
                            size={imageSize}
                            title={title}
                        />
                    )
                }

                {
                    icon && !hideImage && (
                        <View style={styles.leftIconContainer}>
                            <AntDesign name={icon} size={20} color={colors.blue} />
                        </View>
                    )
                }
                <View style={styles.textContainer}>
                    <Text
                        numberOfLines={1}
                        style={{ color: type === "button" ? colors.blue : colors.textColor, ...styles.title }}
                    >
                        {title}
                    </Text>

                    {
                        subTitle && (
                            <Text
                                numberOfLines={1}
                                style={styles.subTitle}
                            >
                                {subTitle}
                            </Text>
                        )
                    }
                </View>

                {
                    type === "checkbox" && (
                        <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                            <Ionicons name="checkmark" size={18} color="white" />
                        </View>
                    )
                }

                {       
                    type === "link" && (
                        <View style={{ ...styles.iconContainer, ...isChecked && styles.checkedStyle }}>
                            <Ionicons name="chevron-forward-outline" size={24} color="black" />
                        </View>
                    )
                }
            </View>
        </TouchableNativeFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 10,
        borderBottomColor: colors.extraLightGrey,
        borderBottomWidth: 1,
        alignItems: "center",
        minHeight: 50,
    },
    textContainer: {
        marginLeft: 14,
        flex: 1,
    },
    title: {
        fontFamily: "medium",
        fontSize: 16,
        letterSpacing: 0.3,
    },
    subTitle: {
        fontFamily: "regular",
        color: colors.grey,
        letterSpacing: 0.3,
    },
    iconContainer: {
        borderWidth: 1,
        borderRadius: 50,
        borderColor: colors.lightGrey,
        backgroundColor: "white",
    },
    checkedStyle: {
        backgroundColor: colors.primary,
        borderColor: "transparent",
    },
    leftIconContainer: {
        backgroundColor: colors.extraLightGrey,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        width: imageSize,
        height: imageSize,
    }
});

export default DataItem;
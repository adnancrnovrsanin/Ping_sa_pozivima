import { StyleSheet, Text } from "react-native";
import PageContainer from "../components/PageContainer";
import { useEffect, useRef } from "react";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { Menu, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import CustomMenuItem from "../components/CustomMenuItem";

const CallsListScreen = (props: any) => {

    const menuRef = useRef(null);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => {
                return (
                    <>
                        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                            <Item 
                                title="Options"
                                iconName="ellipsis-vertical"
                                color="white"
                                onPress={() => {
                                    if (menuRef?.current)
                                    // @ts-ignore
                                        menuRef.current.props.ctx.menuActions.openMenu("CallsListMenu")
                                }}
                            />
                        </HeaderButtons>

                        <Menu name="CallsListMenu" ref={menuRef}>
                            <MenuTrigger />

                            <MenuOptions>
                                <CustomMenuItem text="Settings" icon="settings" />
                            </MenuOptions>
                        </Menu>
                    </>
                );
            }
        })
    }, []);

    return (
        <PageContainer style={styles.container}>
            <Text>CallsListScreen</Text>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: "center",
        textAlign: "center",
    }
})

export default CallsListScreen;
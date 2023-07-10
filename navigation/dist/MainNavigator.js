"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_native_1 = require("react-native");
var native_stack_1 = require("@react-navigation/native-stack");
var bottom_tabs_1 = require("@react-navigation/bottom-tabs");
var vector_icons_1 = require("@expo/vector-icons");
var react_1 = require("react");
var ChatListScreen_1 = require("../screens/ChatListScreen");
var ChatScreen_1 = require("../screens/ChatScreen");
var CallsListScreen_1 = require("../screens/CallsListScreen");
var native_1 = require("@react-navigation/native");
var expo_linear_gradient_1 = require("expo-linear-gradient");
var colors_1 = require("../constants/colors");
var NewChatScreen_1 = require("../screens/NewChatScreen");
var react_redux_1 = require("react-redux");
var chatActions_1 = require("../utils/actions/chatActions");
var Stack = native_stack_1.createNativeStackNavigator();
var Tab = bottom_tabs_1.createBottomTabNavigator();
var TabNavigator = function () {
    return (react_1["default"].createElement(Tab.Navigator, { screenOptions: {
            headerShadowVisible: false,
            headerBackground: function (props) {
                return (react_1["default"].createElement(expo_linear_gradient_1.LinearGradient, { colors: [colors_1["default"].pink, colors_1["default"].primary], start: [0, 0], end: [1, 1], style: { flex: 1 } }));
            },
            headerTitleStyle: {
                fontFamily: "bold",
                fontSize: 24,
                color: "white"
            },
            tabBarVisibilityAnimationConfig: {
                show: {
                    animation: "timing",
                    config: {
                        duration: 300,
                        easing: function () { return 1; }
                    }
                }
            },
            tabBarActiveBackgroundColor: colors_1["default"].pink,
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: colors_1["default"].textColor,
            tabBarStyle: {
                elevation: 0,
                borderTopWidth: 0
            },
            tabBarItemStyle: {
                borderRadius: 20
            }
        } },
        react_1["default"].createElement(Tab.Screen, { name: "ChatList", component: ChatListScreen_1["default"], options: {
                tabBarShowLabel: false,
                headerTitle: "Ping",
                tabBarIcon: function (_a) {
                    var color = _a.color, size = _a.size;
                    return react_1["default"].createElement(vector_icons_1.MaterialIcons, { name: "chat-bubble", size: size, color: color });
                }
            } }),
        react_1["default"].createElement(Tab.Screen, { name: "CallsList", component: CallsListScreen_1["default"], options: {
                tabBarShowLabel: false,
                headerTitle: "Ping",
                tabBarIcon: function (_a) {
                    var color = _a.color, size = _a.size;
                    return react_1["default"].createElement(vector_icons_1.MaterialIcons, { name: "phone", size: size, color: color });
                }
            } })));
};
var StackNavigator = function () {
    return (react_1["default"].createElement(Stack.Navigator, null,
        react_1["default"].createElement(Stack.Screen, { name: "Home", component: TabNavigator, options: {
                headerShown: false
            } }),
        react_1["default"].createElement(Stack.Screen, { name: "ChatScreen", component: ChatScreen_1["default"], options: {
                headerShadowVisible: false,
                headerBackground: function () {
                    return (react_1["default"].createElement(expo_linear_gradient_1.LinearGradient, { colors: [colors_1["default"].pink, colors_1["default"].primary], start: [0, 0], end: [1, 1], style: { flex: 1 } }));
                },
                headerTitleStyle: {
                    fontFamily: "medium",
                    color: "white",
                    fontSize: 15
                },
                headerTintColor: "white"
            } }),
        react_1["default"].createElement(Stack.Group, { screenOptions: { presentation: "containedModal" } },
            react_1["default"].createElement(Stack.Screen, { name: "NewChat", component: NewChatScreen_1["default"] }))));
};
var MainNavigator = function (props) {
    var dispatch = react_redux_1.useDispatch();
    var navigation = native_1.useNavigation();
    var _a = react_1.useState(true), isLoading = _a[0], setIsLoading = _a[1];
    var userData = react_redux_1.useSelector(function (state) { return state.auth.userData; });
    var storedUsers = react_redux_1.useSelector(function (state) { return state.users.storedUsers; });
    var _b = react_1.useState(''), expoPushToken = _b[0], setExpoPushToken = _b[1];
    // console.log(expoPushToken);
    var notificationListener = react_1.useRef();
    var responseListener = react_1.useRef();
    react_1.useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!userData) return [3 /*break*/, 2];
                        return [4 /*yield*/, chatActions_1.getUserChats(userData.phoneNumber)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); })();
    }, [userData]);
    return (react_1["default"].createElement(StackNavigator, null));
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: "center"
    },
    label: {
        fontSize: 18,
        fontFamily: "regular"
    }
});
exports["default"] = MainNavigator;

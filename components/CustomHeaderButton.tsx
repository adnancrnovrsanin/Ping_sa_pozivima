import React from 'react';
import { HeaderButton } from 'react-navigation-header-buttons';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const CustomHeaderButton = (props: any) => {
    return (
        <HeaderButton 
            {...props}
            IconComponent={Ionicons}
            iconSize={20}
            color={props.color ?? colors.blue}
        />
    );
};

export default CustomHeaderButton;
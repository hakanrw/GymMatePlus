import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

type DumbellProp = {
    style?: StyleProp<ViewStyle>
};

export const Dumbell = (data: DumbellProp) => {
    return (
      <View style={[styles.dumbbellIcon, data.style]}>
        <View style={styles.dumbbellWeight} />
        <View style={styles.dumbbellBar} />
        <View style={styles.dumbbellWeight} />
      </View>
    );
}

const styles = StyleSheet.create({
    dumbbellIcon: {
        width: 60,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      dumbbellWeight: {
        width: 18,
        height: 30,
        backgroundColor: '#000',
        borderRadius: 4,
      },
      dumbbellBar: {
        width: 20,
        height: 8,
        backgroundColor: '#000',
        marginHorizontal: 2,
      },
})
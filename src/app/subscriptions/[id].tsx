import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>SubscriptionDetails</Text>
    </View>
  );
};

export default SubscriptionDetails;

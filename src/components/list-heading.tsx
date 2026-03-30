import React from "react";
import { Pressable, Text, View } from "react-native";

const ListHeading = ({ title }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      <Pressable className="list-action">
        <Text className="list-action-text">View all</Text>
      </Pressable>
    </View>
  );
};

export default ListHeading;

import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <Text className="text-5xl text-success font-bold">Home</Text>
      <Text className="text-5xl text-success font-sans-extrabold">Home</Text>
    </SafeAreaView>
  );
}

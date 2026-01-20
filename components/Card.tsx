import { Text, View } from 'react-native';

type CardProps = {
    title: string,
    children?: React.ReactNode;
}

export const Card = ({ title, children }: CardProps) => {

    return (
        <View className="mx-6 mb-6">
            <View className="dark:bg-black bg-white rounded-3xl p-6">
                <Text className="text-gray-900 font-semibold mb-4">{title}</Text>
                <View className="flex-row items-center">
                    {children}
                </View>
            </View>
        </View>
    );
};

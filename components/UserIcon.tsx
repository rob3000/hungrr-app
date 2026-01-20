import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const UserIcon = () => {
    const navigation = useNavigation();
 
    return (
        <View className="flex-row items-center space-x-4 mr-4">
            <TouchableOpacity className='mr-4'>
                <Ionicons name="notifications-outline" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <View className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsjZg0pVUfDbe4RU0YGI0VHcX9nfi75KdRM9ilQbSIJ05aJE9HhUn4ZPvd6t_s6qpePliwp0a8ZpSdu_JH9dHAH8qnr6_0vMLLSAAZB--gw77SLJWiRqXCIUqw9f3n8w0_PUBNf5-YfFyrp9D85WyNsw393GHULJsXBEdGVW_FL0xwzYxTuoi1Bb0cKjZ--AJEWvARoaPlK7ukv1HN_pzygfP0RSPdRrXLtq44jsQ-uyO4ph6CssNr8tvB0PXY_GNXKC24yVYoJF7q' }}
                        className="w-full h-full"
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    codeHighlightContainer: `rounded-md px-1`,
    getStartedContainer: `items-center mx-12`,
    getStartedText: `text-lg leading-6 text-center`,
    helpContainer: `items-center mx-5 mt-4`,
    helpLink: `py-4`,
    helpLinkText: `text-center`,
    homeScreenFilename: `my-2`,
};

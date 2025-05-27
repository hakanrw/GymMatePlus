import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebaseConfig';
import aiService from '../../../services/aiService';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const AIChat: React.FC = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Merhaba! Ben GymMate+ AI antrenörünüzüm. Size antrenman programları oluşturabilirim, egzersiz önerileri verebilirim ve fitness sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?',
            isUser: false,
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const scrollToBottom = () => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateResponse = async (userMessage: string): Promise<string> => {
        try {
            return await aiService.generateResponse(userMessage);
        } catch (error) {
            console.error('AI response error:', error);
            return 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.';
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const aiResponse = await generateResponse(userMessage.text);
            
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Hata', 'Mesaj gönderilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.isUser ? styles.userMessage : styles.aiMessage
        ]}>
            <Text style={[
                styles.messageText,
                item.isUser ? styles.userMessageText : styles.aiMessageText
            ]}>
                {item.text}
            </Text>
            <Text style={[
                styles.timestamp,
                item.isUser ? styles.userTimestamp : styles.aiTimestamp
            ]}>
                {item.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.aiAvatar}>
                        <Ionicons name="cube" size={24} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>GymMate+ AI Antrenör</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="information-circle-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                style={styles.chatContainer}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={styles.loadingText}>AI yanıt hazırlıyor...</Text>
                </View>
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inputContainer}
            >
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Antrenman hakkında soru sorun..."
                        placeholderTextColor="#687076"
                        multiline
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                        editable={!isLoading}
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Ionicons 
                            name="send" 
                            size={24} 
                            color={inputText.trim() && !isLoading ? "#000" : "#687076"} 
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AIChat;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    aiAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#11181C',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 5,
        marginLeft: 15,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    messagesList: {
        padding: 10,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 20,
        marginVertical: 4,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#000',
        borderBottomRightRadius: 4,
    },
    aiMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#fff',
    },
    aiMessageText: {
        color: '#11181C',
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTimestamp: {
        color: 'rgba(255,255,255,0.7)',
    },
    aiTimestamp: {
        color: '#687076',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginLeft: 8,
        color: '#687076',
        fontSize: 14,
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        padding: 10,
        backgroundColor: '#fff',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        marginRight: 10,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        maxHeight: 100,
        color: '#11181C',
        fontSize: 16,
    },
    sendButton: {
        padding: 8,
        borderRadius: 20,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
}); 
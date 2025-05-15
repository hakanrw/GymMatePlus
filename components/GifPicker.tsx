import React, { useState, useEffect } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TENOR_API_KEY = 'AIzaSyCTbh7-jpG-_8QhDyQ8BkoeqmWRNKQj6VE';
const TENOR_API_BASE = 'https://tenor.googleapis.com/v2';

interface GifPickerProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectGif: (gifUrl: string) => void;
}

interface GifResult {
    id: string;
    url: string;
    preview: {
        url: string;
        width: number;
        height: number;
    };
}

export const GifPicker: React.FC<GifPickerProps> = ({ isVisible, onClose, onSelectGif }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchGifs = async (query: string) => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(
                `${TENOR_API_BASE}/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&client_key=my_test_app&limit=20`
            );
            const data = await response.json();
            
            const formattedResults = data.results.map((result: any) => ({
                id: result.id,
                url: result.media_formats.gif.url,
                preview: {
                    url: result.media_formats.tinygif.url,
                    width: result.media_formats.tinygif.dims[0],
                    height: result.media_formats.tinygif.dims[1],
                },
            }));
            
            setGifs(formattedResults);
        } catch (err) {
            setError('Failed to load GIFs. Please try again.');
            console.error('Error fetching GIFs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const debounceTimeout = setTimeout(() => {
                searchGifs(searchQuery);
            }, 500);

            return () => clearTimeout(debounceTimeout);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (isVisible) {
            // Load trending GIFs when modal opens
            searchGifs('trending');
        }
    }, [isVisible]);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Search GIFs</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Tenor GIFs..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                </View>

                {loading ? (
                    <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
                ) : error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : (
                    <FlatList
                        data={gifs}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.gifContainer}
                                onPress={() => {
                                    onSelectGif(item.url);
                                    onClose();
                                }}
                            >
                                <Image
                                    source={{ uri: item.preview.url }}
                                    style={styles.gifPreview}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.gifList}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchIcon: {
        marginHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    gifList: {
        padding: 5,
    },
    gifContainer: {
        flex: 1,
        margin: 5,
        borderRadius: 8,
        overflow: 'hidden',
    },
    gifPreview: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        margin: 20,
    },
}); 
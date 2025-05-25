import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    TextInput,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    options: DropdownOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    style?: any;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    selectedValue,
    onSelect,
    placeholder = "Select an option",
    searchable = false,
    style
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredOptions = searchable
        ? options.filter(option =>
            option.label.toLowerCase().includes(searchText.toLowerCase())
          )
        : options;

    const selectedOption = options.find(option => option.value === selectedValue);

    const handleSelect = (value: string) => {
        onSelect(value);
        setIsVisible(false);
        setSearchText('');
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setIsVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.selectorText,
                    !selectedOption && styles.placeholderText
                ]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <FontAwesome name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setIsVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modal}
                        activeOpacity={1}
                        onPress={() => {}}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Option</Text>
                            <TouchableOpacity
                                onPress={() => setIsVisible(false)}
                                style={styles.closeButton}
                            >
                                <FontAwesome name="times" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {searchable && (
                            <View style={styles.searchContainer}>
                                <FontAwesome name="search" size={16} color="#666" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search..."
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>
                        )}

                        <ScrollView style={styles.optionsList}>
                            {filteredOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.option,
                                        option.value === selectedValue && styles.selectedOption
                                    ]}
                                    onPress={() => handleSelect(option.value)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        option.value === selectedValue && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {option.value === selectedValue && (
                                        <FontAwesome name="check" size={16} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                            {filteredOptions.length === 0 && (
                                <Text style={styles.noOptionsText}>No options found</Text>
                            )}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    placeholderText: {
        color: '#999',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '90%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    optionsList: {
        maxHeight: 300,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedOption: {
        backgroundColor: '#f0f8ff',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    selectedOptionText: {
        color: '#007AFF',
        fontWeight: '500',
    },
    noOptionsText: {
        textAlign: 'center',
        padding: 20,
        color: '#999',
        fontSize: 16,
    },
});

export default Dropdown; 
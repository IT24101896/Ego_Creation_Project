import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
    SafeAreaView, StatusBar, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const CATEGORIES = ['Flowers', 'Chocolates', 'Toys', 'Stationary', 'Decor', 'Home', 'Gifts', 'Birthday', 'Kitchen'];
const BUDGET_RANGES = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100+', min: 100, max: 999 }
];

const CustomRequestScreen = ({ navigate }) => {
    const [loading, setLoading] = useState(false);
    
    // Request Details
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('Gifts');
    const [description, setDescription] = useState('');
    const [budgetRange, setBudgetRange] = useState(BUDGET_RANGES[1]);
    const [urgency, setUrgency] = useState('Normal');
    const [referenceImage, setReferenceImage] = useState(null);
    
    // Personalization Details
    const [personalMessage, setPersonalMessage] = useState('');
    const [fontStyle, setFontStyle] = useState('Elegant');
    const [colorCode, setColorCode] = useState('Gold');

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo library access.');
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        
        if (!result.canceled) setReferenceImage(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        if (!itemName.trim() || !description.trim()) {
            return Alert.alert('Missing Info', 'Please fill in item name and description.');
        }

        if (!global.userToken || global.userRole === 'guest') {
            return Alert.alert('Login Required', 'Please login to submit custom requests.');
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('itemName', itemName.trim());
        formData.append('category', category);
        formData.append('description', description.trim());
        formData.append('budgetMin', budgetRange.min.toString());
        formData.append('budgetMax', budgetRange.max.toString());
        formData.append('urgency', urgency);
        formData.append('personalMessage', personalMessage);
        formData.append('fontStyle', fontStyle);
        formData.append('colorCode', colorCode);
        
        if (referenceImage) {
            formData.append('referenceImage', { 
                uri: referenceImage, 
                name: 'reference.jpg', 
                type: 'image/jpeg' 
            });
        }

        try {
            const res = await api.post('/custom-requests', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            
            Alert.alert(
                '✅ Request Submitted!',
                'Your custom item request has been sent to our team. We\'ll review it and get back to you with pricing and options.',
                [
                    { text: 'OK', onPress: () => navigate('Home') }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🎨 Custom Item Request</Text>
                <Text style={styles.subtitle}>Describe your dream gift and we'll make it happen!</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Item Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📦 Item Details</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="What item do you want?"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={itemName}
                        onChangeText={setItemName}
                    />

                    <Text style={styles.label}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your custom item in detail..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Budget Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Budget Range</Text>
                    <View style={styles.budgetContainer}>
                        {BUDGET_RANGES.map(range => (
                            <TouchableOpacity
                                key={range.label}
                                style={[styles.budgetChip, budgetRange.label === range.label && styles.budgetChipActive]}
                                onPress={() => setBudgetRange(range)}
                            >
                                <Text style={[styles.budgetChipText, budgetRange.label === range.label && styles.budgetChipTextActive]}>
                                    {range.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reference Image */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📸 Reference Image (Optional)</Text>
                    <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                        {referenceImage ? (
                            <>
                                <Image source={{ uri: referenceImage }} style={styles.previewImage} />
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.imageOverlayText}>Tap to Change</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                                <Text style={styles.imagePlaceholderText}>Tap to add reference</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Personalization Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Personalization Details</Text>
                    
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Personal message or text you want..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        numberOfLines={3}
                        value={personalMessage}
                        onChangeText={setPersonalMessage}
                    />

                    <Text style={styles.label}>Font Style</Text>
                    <View style={styles.fontRow}>
                        {['Cursive', 'Bold', 'Elegant', 'Modern'].map(font => (
                            <TouchableOpacity
                                key={font}
                                style={[styles.fontChip, fontStyle === font && styles.fontChipActive]}
                                onPress={() => setFontStyle(font)}
                            >
                                <Text style={[styles.fontChipText, fontStyle === font && styles.fontChipTextActive]}>
                                    {font}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Color Theme</Text>
                    <View style={styles.colorRow}>
                        {['Gold', 'Rose', 'Teal', 'Navy', 'Ivory'].map(color => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorChip, colorCode === color && styles.colorChipActive]}
                                onPress={() => setColorCode(color)}
                            >
                                <Text style={[styles.colorChipText, colorCode === color && styles.colorChipTextActive]}>
                                    {color}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Urgency */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ Urgency</Text>
                    <View style={styles.urgencyRow}>
                        {['Normal', 'Urgent', 'Express'].map(level => (
                            <TouchableOpacity
                                key={level}
                                style={[styles.urgencyChip, urgency === level && styles.urgencyChipActive]}
                                onPress={() => setUrgency(level)}
                            >
                                <Text style={[styles.urgencyChipText, urgency === level && styles.urgencyChipTextActive]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                    style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.submitBtnText}>🚀 Submit Custom Request</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    header: { padding: 20, paddingTop: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#03dac6', marginBottom: 6 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
    content: { flex: 1, paddingHorizontal: 16 },

    section: { 
        backgroundColor: 'rgba(255,255,255,0.06)', 
        borderRadius: 20, 
        padding: 20, 
        marginBottom: 16,
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.08)' 
    },
    sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 16 },

    input: { 
        backgroundColor: 'rgba(255,255,255,0.07)', 
        color: '#fff', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 12,
        fontSize: 15,
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)' 
    },
    textArea: { height: 80, textAlignVertical: 'top' },

    label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8, fontWeight: '600' },

    // Categories
    categoryScroll: { marginBottom: 12 },
    categoryChip: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255,255,255,0.08)', 
        marginRight: 8,
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)' 
    },
    categoryChipActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    categoryChipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 13 },
    categoryChipTextActive: { color: '#fff' },

    // Budget
    budgetContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    budgetChip: { 
        paddingHorizontal: 14, 
        paddingVertical: 10, 
        borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)' 
    },
    budgetChipActive: { backgroundColor: '#03dac6', borderColor: '#03dac6' },
    budgetChipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 12 },
    budgetChipTextActive: { color: '#000' },

    // Image Upload
    imageUpload: { height: 150, borderRadius: 16, overflow: 'hidden', position: 'relative' },
    previewImage: { width: '100%', height: '100%' },
    imageOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    imageOverlayText: { color: '#fff', fontWeight: 'bold' },
    imagePlaceholder: { 
        height: 150, 
        borderRadius: 16, 
        borderStyle: 'dashed', 
        borderWidth: 1.5, 
        borderColor: 'rgba(255,255,255,0.2)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    imagePlaceholderIcon: { fontSize: 36, marginBottom: 8 },
    imagePlaceholderText: { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' },

    // Font & Color
    fontRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    fontChip: { 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)' 
    },
    fontChipActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    fontChipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 12 },
    fontChipTextActive: { color: '#fff' },

    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    colorChip: { 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)' 
    },
    colorChipActive: { backgroundColor: '#03dac6', borderColor: '#03dac6' },
    colorChipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 12 },
    colorChipTextActive: { color: '#000' },

    // Urgency
    urgencyRow: { flexDirection: 'row', gap: 10 },
    urgencyChip: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 12, 
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center' 
    },
    urgencyChipActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
    urgencyChipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 12 },
    urgencyChipTextActive: { color: '#000' },

    // Submit
    submitBtn: { 
        backgroundColor: '#03dac6', 
        padding: 18, 
        borderRadius: 16, 
        alignItems: 'center',
        shadowColor: '#03dac6',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        marginVertical: 20 
    },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default CustomRequestScreen;

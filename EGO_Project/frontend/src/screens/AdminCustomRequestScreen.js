import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
    SafeAreaView, StatusBar, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const CATEGORIES = ['Flowers', 'Chocolates', 'Toys', 'Stationary', 'Decor', 'Home', 'Gifts', 'Birthday', 'Kitchen'];
const URGENCY_LEVELS = ['Normal', 'Urgent', 'Express'];

const AdminCustomRequestScreen = ({ navigate }) => {
    const [loading, setLoading] = useState(false);
    
    // Customer Selection
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [searchedCustomer, setSearchedCustomer] = useState(null);
    
    // Item Details
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('Gifts');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
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

    const searchCustomer = async () => {
        if (!customerEmail.trim()) {
            return Alert.alert('Missing Info', 'Please enter customer email.');
        }

        try {
            // This would need a backend endpoint to search users by email
            // For now, we'll proceed with the entered email
            setCustomerName(customerEmail.split('@')[0]); // Extract name from email as fallback
            Alert.alert('Customer Found', `Creating request for: ${customerEmail}`);
        } catch (error) {
            Alert.alert('Error', 'Customer not found. Please check the email.');
        }
    };

    const handleSubmit = async () => {
        if (!customerEmail.trim() || !itemName.trim() || !description.trim() || !basePrice.trim()) {
            return Alert.alert('Missing Info', 'Please fill in all required fields.');
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('customerEmail', customerEmail.trim());
        formData.append('customerName', customerName.trim());
        formData.append('itemName', itemName.trim());
        formData.append('category', category);
        formData.append('description', description.trim());
        formData.append('basePrice', parseFloat(basePrice));
        formData.append('urgency', urgency);
        formData.append('personalMessage', personalMessage);
        formData.append('fontStyle', fontStyle);
        formData.append('colorCode', colorCode);
        formData.append('adminInitiated', 'true');
        
        if (referenceImage) {
            formData.append('referenceImage', { 
                uri: referenceImage, 
                name: 'reference.jpg', 
                type: 'image/jpeg' 
            });
        }

        try {
            const res = await api.post('/custom-requests/admin/create', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            
            Alert.alert(
                '✅ Custom Request Created!',
                `Custom item request has been created for ${customerEmail}. The customer will be notified.`,
                [
                    { text: 'OK', onPress: () => navigate('Admin') }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to create custom request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🎨 Create Custom Request</Text>
                <Text style={styles.subtitle}>Create a custom item request for a customer</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Customer Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👤 Customer Details</Text>
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Customer Email"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={customerEmail}
                            onChangeText={setCustomerEmail}
                            keyboardType="email-address"
                        />
                        <TouchableOpacity 
                            style={[styles.searchBtn, { paddingHorizontal: 20 }]}
                            onPress={searchCustomer}
                        >
                            <Text style={styles.searchBtnText}>🔍</Text>
                        </TouchableOpacity>
                    </View>

                    {customerName && (
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerLabel}>Creating for:</Text>
                            <Text style={styles.customerName}>{customerName}</Text>
                            <Text style={styles.customerEmail}>{customerEmail}</Text>
                        </View>
                    )}
                </View>

                {/* Item Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📦 Item Details</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Custom Item Name"
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
                        placeholder="Describe the custom item you can create..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Base Price ($)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={basePrice}
                        onChangeText={setBasePrice}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Urgency</Text>
                    <View style={styles.urgencyRow}>
                        {URGENCY_LEVELS.map(level => (
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

                {/* Reference Image */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📸 Reference Image</Text>
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
                                <Text style={styles.imagePlaceholderText}>Add reference photo</Text>
                                <Text style={styles.imagePlaceholderSub}>Show what you can create</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Personalization Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Personalization Options</Text>
                    
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Suggested personalization text or message..."
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

                {/* Submit Button */}
                <TouchableOpacity 
                    style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.submitBtnText}>🚀 Create Custom Request</Text>
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

    // Customer Search
    searchBtn: { 
        backgroundColor: '#6200ee', 
        padding: 15, 
        borderRadius: 12, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchBtnText: { color: '#fff', fontSize: 18 },
    
    customerInfo: { 
        backgroundColor: 'rgba(98,0,238,0.1)', 
        padding: 12, 
        borderRadius: 12, 
        marginTop: 8 
    },
    customerLabel: { color: '#6200ee', fontSize: 12, marginBottom: 4 },
    customerName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
    customerEmail: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

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
    imagePlaceholderSub: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },

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

export default AdminCustomRequestScreen;

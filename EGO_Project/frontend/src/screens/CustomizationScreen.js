import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const FONTS = ['Cursive', 'Bold', 'Elegant', 'Modern'];
const COLORS = [
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Rose', hex: '#FF6B8A' },
    { name: 'Teal', hex: '#03dac6' },
    { name: 'Navy', hex: '#1a237e' },
    { name: 'Ivory', hex: '#FFFFF0' },
];

const CustomizationScreen = ({ navigate, selectedProduct }) => {
    const [message, setMessage] = useState('');
    const [font, setFont] = useState('Elegant');
    const [color, setColor] = useState('Gold');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo library access.');
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const handleSave = async () => {
        if (!message.trim() && !image) return Alert.alert('Add Details', 'Enter a message or upload an image.');
        if (!global.userToken || global.userRole === 'guest') return Alert.alert('Login Required', 'Please login to save customizations.');

        setLoading(true);
        const formData = new FormData();
        formData.append('productId', selectedProduct?._id || 'demo_1');
        formData.append('personalizedMessage', message);
        formData.append('fontStyle', font);
        formData.append('colorCode', color);
        if (image) formData.append('image', { uri: image, name: 'custom.jpg', type: 'image/jpeg' });

        try {
            const res = await api.post('/customs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert('✅ Design Saved!', 'Your customization has been saved. Proceed to checkout!', [
                { text: 'Go to Checkout', onPress: () => navigate('Checkout', { product: selectedProduct, customizationId: res.data._id }) }
            ]);
        } catch (e) {
            Alert.alert('Error', 'Could not save. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const selectedColorHex = COLORS.find(c => c.name === color)?.hex || '#FFD700';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>✨ Personalize Your Gift</Text>
                    <Text style={styles.productName}>{selectedProduct?.name || 'Your Selected Gift'}</Text>
                    <Text style={styles.priceBadge}>${(parseFloat(selectedProduct?.price) || 0).toFixed(2)}</Text>
                </View>

                {/* Photo Upload */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📸 Reference Photo</Text>
                    <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
                        {image ? (
                            <>
                                <Image source={{ uri: image }} style={styles.photoPreview} />
                                <View style={styles.photoOverlay}>
                                    <Text style={styles.photoOverlayText}>Tap to Change</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Text style={styles.photoPlaceholderIcon}>🖼️</Text>
                                <Text style={styles.photoPlaceholderText}>Tap to add a photo</Text>
                                <Text style={styles.photoPlaceholderSub}>PNG, JPG accepted</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Message */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💌 Personal Message</Text>
                    <View style={styles.messagePreview}>
                        <Text style={[styles.messagePreviewText, {
                            fontFamily: font === 'Cursive' ? 'serif' : 'sans-serif',
                            fontSize: font === 'Bold' ? 16 : 14,
                            color: selectedColorHex
                        }]}>
                            {message || 'Your message will appear here...'}
                        </Text>
                    </View>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Write something heartfelt..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        maxLength={150}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <Text style={styles.charCount}>{message.length}/150</Text>
                </View>

                {/* Font */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔤 Font Style</Text>
                    <View style={styles.chipRow}>
                        {FONTS.map(f => (
                            <TouchableOpacity key={f}
                                style={[styles.chip, font === f && styles.chipActive]}
                                onPress={() => setFont(f)}>
                                <Text style={[styles.chipText, font === f && styles.chipTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Color */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎨 Accent Color</Text>
                    <View style={styles.colorRow}>
                        {COLORS.map(c => (
                            <TouchableOpacity key={c.name}
                                style={[styles.colorCircle, { backgroundColor: c.hex }, color === c.name && styles.colorCircleActive]}
                                onPress={() => setColor(c.name)}>
                                {color === c.name && <Text style={styles.colorCheck}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                        onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                        {loading
                            ? <ActivityIndicator color="#000" />
                            : <Text style={styles.saveBtnText}>💾  Save Customization</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.checkoutBtn}
                        onPress={() => navigate('Checkout', { product: selectedProduct })}
                        activeOpacity={0.85}>
                        <Text style={styles.checkoutBtnText}>🛒  Skip & Go to Checkout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    orb1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(98,0,238,0.2)', top: 0, right: -60, zIndex: 0 },
    orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(3,218,198,0.1)', bottom: 200, left: -60, zIndex: 0 },

    // Header
    header: { padding: 24, paddingTop: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#03dac6', marginBottom: 6 },
    productName: { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
    priceBadge: { fontSize: 24, fontWeight: '900', color: '#fff' },

    // Sections
    section: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20, padding: 20,
        marginHorizontal: 16, marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
    },
    sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 14 },

    // Photo
    photoBox: { borderRadius: 16, overflow: 'hidden', position: 'relative', height: 180 },
    photoPreview: { width: '100%', height: 180, borderRadius: 16 },
    photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
    photoOverlayText: { color: '#fff', fontWeight: 'bold' },
    photoPlaceholder: { height: 180, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    photoPlaceholderIcon: { fontSize: 36, marginBottom: 10 },
    photoPlaceholderText: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 15 },
    photoPlaceholderSub: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },

    // Message
    messagePreview: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, marginBottom: 12, minHeight: 60, justifyContent: 'center' },
    messagePreviewText: { fontStyle: 'italic', textAlign: 'center' },
    messageInput: { backgroundColor: 'rgba(255,255,255,0.07)', color: '#fff', borderRadius: 14, padding: 14, height: 90, textAlignVertical: 'top', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    charCount: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'right', marginTop: 4 },

    // Chips
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    chipActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    chipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 13 },
    chipTextActive: { color: '#fff' },

    // Colors
    colorRow: { flexDirection: 'row', gap: 12 },
    colorCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    colorCircleActive: { borderColor: '#fff', transform: [{ scale: 1.15 }] },
    colorCheck: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Actions
    actions: { paddingHorizontal: 16, gap: 12 },
    saveBtn: { backgroundColor: '#03dac6', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#03dac6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
    saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    checkoutBtn: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    checkoutBtnText: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 15 },
});

export default CustomizationScreen;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const MediaScreen = () => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission Needed', 'Allow photo library access.');
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 0.85,
        });
        if (!result.canceled) { setImage(result.assets[0].uri); setUploaded(false); }
    };

    const uploadImage = async () => {
        if (!image) return Alert.alert('EGO', 'Please select an image first.');
        if (!global.userToken || global.userRole === 'guest') return Alert.alert('Login Required', 'Please login to upload media.');
        setUploading(true);
        const formData = new FormData();
        formData.append('image', { uri: image, name: 'media.jpg', type: 'image/jpeg' });
        try {
            await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploaded(true);
            Alert.alert('✅ Uploaded!', 'Your image has been uploaded successfully.');
        } catch (e) {
            Alert.alert('Upload Failed', 'Make sure your server is running.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroIcon}>📸</Text>
                    <Text style={styles.heroTitle}>Media Lab</Text>
                    <Text style={styles.heroSub}>Upload reference images for your personalized gifts</Text>
                </View>

                {/* Upload Area */}
                <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.85}>
                    {image ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.preview} />
                            <View style={styles.imageOverlay}>
                                <Text style={styles.overlayText}>📷  Tap to Change</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderEmoji}>🖼️</Text>
                            <Text style={styles.placeholderTitle}>Select an Image</Text>
                            <Text style={styles.placeholderSub}>Tap here to choose from your gallery</Text>
                            <View style={styles.uploadDottedBox}>
                                <Text style={styles.uploadDottedText}>JPG · PNG · WEBP</Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Actions */}
                {image && (
                    <View style={styles.actionBox}>
                        <TouchableOpacity style={styles.changeBtn} onPress={pickImage} activeOpacity={0.8}>
                            <Text style={styles.changeBtnText}>🔄  Change Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.uploadBtn, (uploading || uploaded) && { opacity: 0.7 }]}
                            onPress={uploadImage}
                            disabled={uploading || uploaded}
                            activeOpacity={0.85}>
                            {uploading
                                ? <><ActivityIndicator color="#000" size="small" /><Text style={[styles.uploadBtnText, { marginLeft: 10 }]}>Uploading...</Text></>
                                : uploaded
                                    ? <Text style={styles.uploadBtnText}>✅  Uploaded!</Text>
                                    : <Text style={styles.uploadBtnText}>☁️  Upload to Server</Text>
                            }
                        </TouchableOpacity>
                    </View>
                )}

                {/* Info Cards */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxIcon}>🎁</Text>
                        <Text style={styles.infoBoxTitle}>Gift Reference</Text>
                        <Text style={styles.infoBoxText}>Upload photos to inspire your gift design</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxIcon}>🖌️</Text>
                        <Text style={styles.infoBoxTitle}>Personalize</Text>
                        <Text style={styles.infoBoxText}>Use uploaded images in customization</Text>
                    </View>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    orb1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(98,0,238,0.2)', top: 0, left: -70 },
    orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(3,218,198,0.1)', bottom: 50, right: -60 },

    content: { padding: 20, paddingTop: 10 },

    hero: { alignItems: 'center', paddingVertical: 28 },
    heroIcon: { fontSize: 52, marginBottom: 12 },
    heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    heroSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },

    uploadArea: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 24, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden', minHeight: 220,
        justifyContent: 'center', alignItems: 'center',
    },
    imageContainer: { width: '100%', position: 'relative' },
    preview: { width: '100%', height: 250 },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
    overlayText: { color: '#fff', fontWeight: 'bold', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },

    placeholder: { padding: 40, alignItems: 'center' },
    placeholderEmoji: { fontSize: 48, marginBottom: 14 },
    placeholderTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
    placeholderSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 16, textAlign: 'center' },
    uploadDottedBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 10 },
    uploadDottedText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },

    actionBox: { gap: 10, marginBottom: 20 },
    changeBtn: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    changeBtnText: { color: 'rgba(255,255,255,0.65)', fontWeight: 'bold', fontSize: 15 },
    uploadBtn: { backgroundColor: '#03dac6', padding: 18, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#03dac6', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    uploadBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    infoGrid: { flexDirection: 'row', gap: 12 },
    infoBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    infoBoxIcon: { fontSize: 30, marginBottom: 10 },
    infoBoxTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 6, textAlign: 'center' },
    infoBoxText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});

export default MediaScreen;

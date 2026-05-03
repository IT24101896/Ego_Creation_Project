import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator,
    SafeAreaView, StatusBar, ScrollView, FlatList, TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia, getPhotosByCategory, getCategoryStats } from '../services/api';

const CATEGORIES = [
    { name: 'Gift Ideas', icon: '🎁', color: '#ff6b6b' },
    { name: 'Inspirations', icon: '💡', color: '#4ecdc4' },
    { name: 'Reference Photos', icon: '📸', color: '#45b7d1' },
    { name: 'Custom Samples', icon: '✨', color: '#96ceb4' },
    { name: 'General', icon: '📁', color: '#dfe6e9' }
];

const MediaGalleryScreen = ({ navigate }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [photos, setPhotos] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    
    // Upload form states
    const [selectedImage, setSelectedImage] = useState(null);
    const [photoTitle, setPhotoTitle] = useState('');
    const [photoDescription, setPhotoDescription] = useState('');
    const [uploadCategory, setUploadCategory] = useState('General');

    useEffect(() => {
        fetchCategoryStats();
        fetchPhotos('all');
    }, []);

    const fetchCategoryStats = async () => {
        try {
            const res = await getCategoryStats();
            setCategoryStats(res.data);
        } catch (error) {
            console.error('Error fetching category stats:', error);
        }
    };

    const fetchPhotos = async (category) => {
        setLoading(true);
        try {
            const res = await getPhotosByCategory(category);
            setPhotos(res.data || []);
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert('Permission Needed', 'Allow photo library access.');
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
        });
        
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            return Alert.alert('Error', 'Please select an image first.');
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', { 
            uri: selectedImage, 
            name: 'photo.jpg', 
            type: 'image/jpeg' 
        });
        formData.append('category', uploadCategory);
        formData.append('title', photoTitle);
        formData.append('description', photoDescription);

        try {
            await uploadMedia(formData);
            Alert.alert('✅ Success!', 'Photo uploaded successfully.');
            
            // Reset form
            setSelectedImage(null);
            setPhotoTitle('');
            setPhotoDescription('');
            setShowUploadForm(false);
            
            // Refresh data
            fetchCategoryStats();
            fetchPhotos(selectedCategory);
        } catch (error) {
            Alert.alert('Upload Failed', 'Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const renderCategoryChip = (category) => {
        const count = categoryStats.find(c => c.category === category.name)?.count || 0;
        const isSelected = selectedCategory === category.name.toLowerCase().replace(' ', '-');
        
        return (
            <TouchableOpacity
                key={category.name}
                style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: category.color }
                ]}
                onPress={() => {
                    const catKey = category.name.toLowerCase().replace(' ', '-');
                    setSelectedCategory(catKey);
                    fetchPhotos(catKey);
                }}
            >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                    styles.categoryText,
                    isSelected && { color: '#fff' }
                ]}>
                    {category.name}
                </Text>
                <Text style={[
                    styles.categoryCount,
                    isSelected && { color: '#fff' }
                ]}>
                    ({count})
                </Text>
            </TouchableOpacity>
        );
    };

    const renderPhoto = ({ item }) => (
        <View style={styles.photoCard}>
            <Image 
                source={{ uri: `${api.defaults.baseURL}${item.fileUrl}` }} 
                style={styles.photoImage}
            />
            <View style={styles.photoInfo}>
                {item.title && (
                    <Text style={styles.photoTitle}>{item.title}</Text>
                )}
                <Text style={styles.photoCategory}>{item.category}</Text>
                <Text style={styles.photoDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    if (showUploadForm) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowUploadForm(false)}>
                        <Text style={styles.backBtn}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Upload Photo</Text>
                    <View style={{ width: 50 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Image Selection */}
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {selectedImage ? (
                            <>
                                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.overlayText}>📷 Tap to Change</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.placeholder}>
                                <Text style={styles.placeholderIcon}>📷</Text>
                                <Text style={styles.placeholderText}>Select Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Category Selection */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.name}
                                    style={[
                                        styles.categoryOption,
                                        uploadCategory === cat.name && { backgroundColor: cat.color }
                                    ]}
                                    onPress={() => setUploadCategory(cat.name)}
                                >
                                    <Text style={[
                                        styles.categoryOptionText,
                                        uploadCategory === cat.name && { color: '#fff' }
                                    ]}>
                                        {cat.icon} {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Title and Description */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Title (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Give your photo a title..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={photoTitle}
                            onChangeText={setPhotoTitle}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe this photo..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            multiline
                            numberOfLines={3}
                            value={photoDescription}
                            onChangeText={setPhotoDescription}
                        />
                    </View>

                    {/* Upload Button */}
                    <TouchableOpacity
                        style={[styles.uploadBtn, uploading && { opacity: 0.7 }]}
                        onPress={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.uploadBtnText}>☁️ Upload Photo</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            
            <View style={styles.header}>
                <Text style={styles.title}>📸 Media Gallery</Text>
                <TouchableOpacity 
                    style={styles.uploadHeaderBtn}
                    onPress={() => setShowUploadForm(true)}
                >
                    <Text style={styles.uploadHeaderBtnText}>➕ Upload</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Category Filter */}
                <View style={styles.categorySection}>
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === 'all' && { backgroundColor: '#6200ee' }
                        ]}
                        onPress={() => {
                            setSelectedCategory('all');
                            fetchPhotos('all');
                        }}
                    >
                        <Text style={styles.categoryIcon}>📁</Text>
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === 'all' && { color: '#fff' }
                        ]}>
                            All Photos
                        </Text>
                        <Text style={[
                            styles.categoryCount,
                            selectedCategory === 'all' && { color: '#fff' }
                        ]}>
                            ({categoryStats.reduce((sum, c) => sum + c.count, 0)})
                        </Text>
                    </TouchableOpacity>
                    
                    {CATEGORIES.map(renderCategoryChip)}
                </View>

                {/* Photos Grid */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.loadingText}>Loading photos...</Text>
                    </View>
                ) : photos.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📸</Text>
                        <Text style={styles.emptyTitle}>No Photos Yet</Text>
                        <Text style={styles.emptyText}>
                            Start uploading photos to organize them by category!
                        </Text>
                        <TouchableOpacity 
                            style={styles.startUploadBtn}
                            onPress={() => setShowUploadForm(true)}
                        >
                            <Text style={styles.startUploadBtnText}>📷 Upload First Photo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={photos}
                        keyExtractor={item => item._id}
                        renderItem={renderPhoto}
                        numColumns={2}
                        contentContainerStyle={styles.photosGrid}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    header: { 
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 20, 
        paddingTop: 50,
        backgroundColor: '#0a0015'
    },
    backBtn: { color: '#03dac6', fontSize: 18, fontWeight: 'bold' },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    uploadHeaderBtn: { 
        backgroundColor: '#03dac6', 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 20 
    },
    uploadHeaderBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
    
    content: { flex: 1, padding: 16 },

    // Category Filter
    categorySection: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 20 
    },
    categoryChip: { 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    categoryIcon: { fontSize: 16, marginRight: 4 },
    categoryText: { color: '#fff', fontWeight: '600', fontSize: 12, marginRight: 4 },
    categoryCount: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },

    // Upload Form
    imagePicker: { 
        height: 200, 
        borderRadius: 16, 
        overflow: 'hidden', 
        marginBottom: 20,
        position: 'relative'
    },
    previewImage: { width: '100%', height: '100%' },
    imageOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    overlayText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    placeholder: { 
        height: 200, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderStyle: 'dashed', 
        borderWidth: 2, 
        borderColor: 'rgba(255,255,255,0.3)', 
        borderRadius: 16 
    },
    placeholderIcon: { fontSize: 40, marginBottom: 8 },
    placeholderText: { color: 'rgba(255,255,255,0.5)' },

    formSection: { marginBottom: 20 },
    label: { color: '#fff', fontWeight: 'bold', marginBottom: 8 },
    categoryOption: { 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 16, 
        marginRight: 8 
    },
    categoryOptionText: { color: '#fff', fontWeight: '600' },
    input: { 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        color: '#fff', 
        padding: 12, 
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    uploadBtn: { 
        backgroundColor: '#03dac6', 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    uploadBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Photos Grid
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingTop: 100 
    },
    loadingText: { color: '#fff', marginTop: 12 },
    emptyContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: 100 
    },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
    startUploadBtn: { 
        backgroundColor: '#6200ee', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        borderRadius: 12 
    },
    startUploadBtnText: { color: '#fff', fontWeight: 'bold' },

    photosGrid: { paddingBottom: 20 },
    photoCard: { 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 12, 
        overflow: 'hidden',
        margin: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    photoImage: { 
        width: '100%', 
        height: 120, 
        resizeMode: 'cover' 
    },
    photoInfo: { padding: 8 },
    photoTitle: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 12, 
        marginBottom: 2 
    },
    photoCategory: { 
        color: 'rgba(255,255,255,0.6)', 
        fontSize: 10, 
        marginBottom: 2 
    },
    photoDate: { 
        color: 'rgba(255,255,255,0.4)', 
        fontSize: 9 
    }
});

export default MediaGalleryScreen;

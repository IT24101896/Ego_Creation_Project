import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import api from '../services/api';

const ReviewScreen = ({ navigate, selectedProduct }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [publicReviews, setPublicReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        fetchPublicReviews();
    }, []);

    const fetchPublicReviews = async () => {
        setReviewsLoading(true);
        try {
            // Fetch approved reviews for a specific product or general
            const productId = selectedProduct?._id;
            if (productId && productId !== 'demo_1') {
                const res = await api.get(`/reviews/product/${productId}`);
                setPublicReviews(res.data || []);
            } else {
                setPublicReviews([]);
            }
        } catch (e) {
            setPublicReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!comment.trim()) return Alert.alert('Error', 'Please write a comment.');

        if (!global.userToken || global.userRole === 'guest') {
            return Alert.alert('Login Required', 'You must be logged in to leave a review.');
        }

        // Need a valid product ID — use selectedProduct or show error
        const productId = selectedProduct?._id;
        if (!productId || productId.startsWith('demo_')) {
            return Alert.alert('Select a Product', 'Please browse the shop and select a product before leaving a review.');
        }

        setLoading(true);
        try {
            await api.post('/reviews', {
                product: productId,
                rating,
                comment: comment.trim()
            });
            setSubmitted(true);
            Alert.alert(
                '⭐ Review Submitted!',
                'Thank you! The admin will review and approve it shortly.',
                [{ text: 'View Orders', onPress: () => navigate('Orders') }, { text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not post review.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn}>
                    <Text style={[styles.starText, { color: s <= rating ? '#FFD700' : '#ddd' }]}>★</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (submitted) {
        return (
            <View style={styles.successContainer}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>Review Submitted!</Text>
                <Text style={styles.successText}>Your review is pending admin approval.</Text>
                <TouchableOpacity style={styles.btn} onPress={() => navigate('Orders')}>
                    <Text style={styles.btnText}>Track My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#f0f0f0', marginTop: 10 }]}
                    onPress={() => { setSubmitted(false); setComment(''); setRating(5); }}>
                    <Text style={[styles.btnText, { color: '#333' }]}>Write Another Review</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Write Review */}
            <View style={styles.card}>
                <Text style={styles.title}>
                    ⭐ Review: {selectedProduct?.name || 'A Gift'}
                </Text>

                <Text style={styles.label}>Your Rating</Text>
                {renderStars()}
                <Text style={styles.ratingLabel}>
                    {['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent!'][rating]}
                </Text>

                <Text style={styles.label}>Your Comment</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Tell us about your experience..."
                    placeholderTextColor="#aaa"
                    multiline
                    value={comment}
                    onChangeText={setComment}
                    maxLength={300}
                />
                <Text style={styles.charCount}>{comment.length}/300</Text>

                <TouchableOpacity
                    style={[styles.btn, loading && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnText}>Submit Review</Text>
                    }
                </TouchableOpacity>

                {(!selectedProduct || selectedProduct._id?.startsWith('demo_') || !global.userToken) && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            💡 Go to Shop → select a product → "Leave Review" to submit a real review.
                        </Text>
                    </View>
                )}
            </View>

            {/* Public Reviews */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                    💬 Public Reviews {publicReviews.length > 0 ? `(${publicReviews.length})` : ''}
                </Text>
                {reviewsLoading ? (
                    <ActivityIndicator color="#6200ee" />
                ) : publicReviews.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No approved reviews yet for this product. Be the first!
                    </Text>
                ) : (
                    publicReviews.map(r => (
                        <View key={r._id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewUser}>{r.user?.name || 'User'}</Text>
                                <Text style={{ color: '#FFD700' }}>{'★'.repeat(r.rating)}</Text>
                            </View>
                            <Text style={styles.reviewComment}>"{r.comment}"</Text>
                        </View>
                    ))
                )}
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8', padding: 15 },

    card: { backgroundColor: '#fff', padding: 22, borderRadius: 18, marginBottom: 15, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#6200ee', marginBottom: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 12 },

    // Stars
    starsRow: { flexDirection: 'row', marginBottom: 4 },
    starBtn: { marginRight: 8 },
    starText: { fontSize: 42 },
    ratingLabel: { color: '#6200ee', fontWeight: 'bold', fontSize: 14, marginBottom: 12, height: 20 },

    // Input
    input: {
        backgroundColor: '#f5f5f5',
        padding: 14, borderRadius: 12,
        height: 120, textAlignVertical: 'top',
        fontSize: 15, color: '#333',
        borderWidth: 1, borderColor: '#e0e0e0'
    },
    charCount: { color: '#bbb', fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: 12 },

    // Button
    btn: { backgroundColor: '#6200ee', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Info
    infoBox: { backgroundColor: '#f3e5f5', padding: 12, borderRadius: 10, marginTop: 14 },
    infoText: { color: '#6a1b9a', fontSize: 13 },

    // Public Reviews
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 14 },
    emptyText: { color: '#999', textAlign: 'center', paddingVertical: 15 },
    reviewItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    reviewUser: { fontWeight: 'bold', color: '#333' },
    reviewComment: { color: '#666', fontStyle: 'italic', fontSize: 14 },

    // Success State
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f4f4f8' },
    successIcon: { fontSize: 60, marginBottom: 16 },
    successTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    successText: { color: '#888', textAlign: 'center', marginBottom: 30, fontSize: 15 },
});

export default ReviewScreen;

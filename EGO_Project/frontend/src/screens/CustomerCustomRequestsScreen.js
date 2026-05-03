import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
    SafeAreaView, StatusBar, Image
} from 'react-native';
import api from '../services/api';

const CustomerCustomRequestsScreen = ({ navigate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const res = await api.get('/custom-requests/myrequests');
            setRequests(res.data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuote = async (requestId, quotedPrice) => {
        Alert.alert(
            'Accept Quote',
            `Are you sure you want to accept this quote for $${quotedPrice}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Accept', 
                    onPress: async () => {
                        try {
                            await api.put(`/custom-requests/${requestId}/respond`, { 
                                customerResponse: 'Accepted' 
                            });
                            
                            // Create order from accepted request
                            await api.post('/orders/create-from-custom-request', { 
                                customRequestId: requestId 
                            });
                            
                            Alert.alert(
                                '✅ Quote Accepted!',
                                'Your order has been created successfully. You can view it in My Orders.',
                                [
                                    { text: 'OK', onPress: () => navigate('Orders') }
                                ]
                            );
                            fetchMyRequests();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to accept quote. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleRejectQuote = async (requestId) => {
        Alert.alert(
            'Reject Quote',
            'Are you sure you want to reject this quote?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Reject', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.put(`/custom-requests/${requestId}/respond`, { 
                                customerResponse: 'Rejected' 
                            });
                            Alert.alert('❌ Quote Rejected', 'The quote has been rejected.');
                            fetchMyRequests();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject quote. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const renderRequest = ({ item }) => {
        const statusColor = {
            'Pending': '#f59e0b',
            'Quoted': '#3b82f6', 
            'Approved': '#10b981',
            'Rejected': '#ef4444',
            'In Progress': '#8b5cf6',
            'Completed': '#10b981'
        }[item.status] || '#f59e0b';

        const statusIcon = {
            'Pending': '⏳',
            'Quoted': '💰',
            'Approved': '✅', 
            'Rejected': '❌',
            'In Progress': '🔨',
            'Completed': '🎉'
        }[item.status] || '⏳';

        return (
            <View style={styles.requestCard}>
                {/* Header */}
                <View style={styles.requestHeader}>
                    <View>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        <Text style={styles.category}>🏷️ {item.category}</Text>
                        <Text style={styles.date}>
                            📅 {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusIcon} {item.status}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>📝 Description:</Text>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                </View>

                {/* Personalization */}
                {(item.personalMessage || item.fontStyle || item.colorCode) && (
                    <View style={styles.personalizationSection}>
                        <Text style={styles.sectionTitle}>✨ Personalization:</Text>
                        {item.personalMessage && (
                            <Text style={styles.personalizationText}>
                                Message: "{item.personalMessage}"
                            </Text>
                        )}
                        <Text style={styles.personalizationText}>
                            Font: {item.fontStyle} | Color: {item.colorCode}
                        </Text>
                    </View>
                )}

                {/* Reference Image */}
                {item.referenceImage && (
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>📸 Reference:</Text>
                        <Image 
                            source={{ uri: `${api.defaults.baseURL}${item.referenceImage}` }} 
                            style={styles.referenceImage}
                        />
                    </View>
                )}

                {/* Admin Quote */}
                {item.quotedPrice && item.status === 'Quoted' && (
                    <View style={styles.quoteSection}>
                        <Text style={styles.sectionTitle}>💰 Admin Quote:</Text>
                        <View style={styles.quoteDetails}>
                            <Text style={styles.priceText}>Price: ${item.quotedPrice}</Text>
                            <Text style={styles.daysText}>Est. {item.estimatedDays} days</Text>
                            {item.adminNotes && (
                                <Text style={styles.adminNotes}>Notes: {item.adminNotes}</Text>
                            )}
                        </View>
                        
                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.acceptBtn, { backgroundColor: '#10b981' }]}
                                onPress={() => handleAcceptQuote(item._id, item.quotedPrice)}
                            >
                                <Text style={styles.btnText}>✅ Accept & Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.rejectBtn, { backgroundColor: '#ef4444' }]}
                                onPress={() => handleRejectQuote(item._id)}
                            >
                                <Text style={styles.btnText}>❌ Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Approved/Rejected Status */}
                {item.customerResponse && (
                    <View style={styles.responseSection}>
                        <Text style={styles.sectionTitle}>📋 Your Response:</Text>
                        <View style={[styles.responseBadge, { 
                            backgroundColor: item.customerResponse === 'Accepted' ? '#10b98120' : '#ef444420' 
                        }]}>
                            <Text style={[styles.responseText, { 
                                color: item.customerResponse === 'Accepted' ? '#10b981' : '#ef4444' 
                            }]}>
                                {item.customerResponse === 'Accepted' ? '✅ Accepted - Order Created' : '❌ Rejected'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* In Progress/Completed Status */}
                {(item.status === 'In Progress' || item.status === 'Completed') && (
                    <View style={styles.progressSection}>
                        <Text style={styles.sectionTitle}>🔧 Status:</Text>
                        <Text style={styles.statusText}>
                            {item.status === 'In Progress' ? 'Your custom item is being created!' : 'Your custom item is ready!'}
                        </Text>
                        {item.status === 'Completed' && (
                            <TouchableOpacity 
                                style={styles.viewOrderBtn}
                                onPress={() => navigate('Orders')}
                            >
                                <Text style={styles.viewOrderBtnText}>📦 View in Orders</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6200ee" />
                    <Text style={styles.loadingText}>Loading your custom requests...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🎨 My Custom Requests</Text>
                <Text style={styles.subtitle}>Track your custom item requests</Text>
            </View>

            <FlatList
                data={requests}
                keyExtractor={item => item._id}
                renderItem={renderRequest}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎨</Text>
                        <Text style={styles.emptyTitle}>No Custom Requests Yet</Text>
                        <Text style={styles.emptyText}>
                            Request custom items from our admin team!
                        </Text>
                        <TouchableOpacity 
                            style={styles.createBtn}
                            onPress={() => navigate('CustomRequest')}
                        >
                            <Text style={styles.createBtnText}>➕ Create Custom Request</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#666', marginTop: 12, fontSize: 16 },
    
    header: { 
        backgroundColor: '#6200ee', 
        padding: 20, 
        paddingTop: 50 
    },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    
    list: { padding: 16 },
    
    requestCard: { 
        backgroundColor: '#fff', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4
    },
    
    requestHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 16 
    },
    itemName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    category: { fontSize: 14, color: '#666', marginBottom: 2 },
    date: { fontSize: 12, color: '#999' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    descriptionSection: { marginBottom: 16 },
    descriptionText: { color: '#666', lineHeight: 20 },
    
    personalizationSection: { 
        backgroundColor: '#f8f9fa', 
        padding: 12, 
        borderRadius: 12, 
        marginBottom: 16 
    },
    personalizationText: { color: '#666', fontSize: 13, marginBottom: 4 },
    
    imageSection: { marginBottom: 16 },
    referenceImage: { width: '100%', height: 150, borderRadius: 8 },
    
    quoteSection: { 
        backgroundColor: '#e8f5e8', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 16 
    },
    quoteDetails: { marginBottom: 12 },
    priceText: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginBottom: 4 },
    daysText: { fontSize: 14, color: '#666', marginBottom: 4 },
    adminNotes: { fontSize: 12, color: '#666', fontStyle: 'italic' },
    
    actionButtons: { flexDirection: 'row', gap: 12 },
    acceptBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
    rejectBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    
    responseSection: { marginBottom: 16 },
    responseBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    responseText: { fontSize: 14, fontWeight: 'bold' },
    
    progressSection: { 
        backgroundColor: '#f0f4ff', 
        padding: 16, 
        borderRadius: 12 
    },
    statusText: { color: '#6200ee', fontSize: 14, marginBottom: 8 },
    viewOrderBtn: { 
        backgroundColor: '#6200ee', 
        padding: 10, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    viewOrderBtnText: { color: '#fff', fontWeight: 'bold' },
    
    emptyContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: 80 
    },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    emptyText: { color: '#666', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
    createBtn: { 
        backgroundColor: '#6200ee', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        borderRadius: 12 
    },
    createBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default CustomerCustomRequestsScreen;

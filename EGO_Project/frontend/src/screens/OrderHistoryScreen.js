import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import api from '../services/api';

const STATUS_CONFIG = {
    Pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
    Processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '⚙️' },
    Shipped:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '🚚' },
    Delivered:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
    Cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
};

const OrderHistoryScreen = ({ navigate }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/myorders');
            setOrders(res.data || []);
        } catch (e) {
            console.log('Order fetch error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const res = await api.put(`/orders/${orderId}/cancel`);
            Alert.alert('✅ Order Cancelled', 'Your order has been successfully cancelled.');
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order.');
        }
    };

    const renderOrder = ({ item, index }) => {
        const status = item.status || 'Pending';
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

        return (
            <View style={styles.card}>
                {/* Order Header */}
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderId}>Order #{item._id?.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>
                            📅 {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                    <Text style={styles.orderAmount}>${(parseFloat(item.totalAmount) || 0).toFixed(2)}</Text>
                </View>

                {/* Status */}
                <View style={[styles.statusWrap, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>
                        {cfg.icon}  {status}
                    </Text>
                </View>

                {/* Timeline Steps */}
                <View style={styles.timeline}>
                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                        const done = ['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(status) >= i;
                        return (
                            <View key={step} style={styles.timelineStep}>
                                <View style={[styles.timelineDot, done && styles.timelineDotDone]} />
                                <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>{step}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Items */}
                {item.products?.length > 0 && (
                    <Text style={styles.itemsText}>
                        🎁 {item.products.length} item{item.products.length > 1 ? 's' : ''}
                        {item.paymentMethod ? `  ·  ${item.paymentMethod}` : ''}
                    </Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {/* Cancel Button for Pending Orders */}
                    {status === 'Pending' && (
                        <TouchableOpacity style={styles.cancelBtn}
                            onPress={() => {
                                Alert.alert(
                                    'Cancel Order',
                                    'Are you sure you want to cancel this order?',
                                    [
                                        { text: 'No', style: 'cancel' },
                                        { text: 'Yes, Cancel', style: 'destructive', onPress: () => handleCancelOrder(item._id) }
                                    ]
                                );
                            }}>
                            <Text style={styles.cancelBtnText}>❌ Cancel Order</Text>
                        </TouchableOpacity>
                    )}

                    {/* Review Button for Delivered Orders */}
                    {status === 'Delivered' && (
                        <TouchableOpacity style={styles.reviewBtn}
                            onPress={() => navigate('Review', { selectedProduct: item.products?.[0]?.product })}>
                            <Text style={styles.reviewBtnText}>⭐ Leave a Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6200ee" />
                    <Text style={styles.loadingText}>Loading your orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f8" />

            {/* Stats Row */}
            {orders.length > 0 && (
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{orders.filter(o => o.status === 'Delivered').length}</Text>
                        <Text style={styles.statLabel}>Delivered</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>
                            ${orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0).toFixed(0)}
                        </Text>
                        <Text style={styles.statLabel}>Total Spent</Text>
                    </View>
                </View>
            )}

            <FlatList
                data={orders}
                keyExtractor={item => item._id}
                renderItem={renderOrder}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyTitle}>No orders yet</Text>
                        <Text style={styles.emptyText}>Your orders will appear here once you make a purchase.</Text>
                        <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigate('Products')}>
                            <Text style={styles.shopNowText}>🛍️  Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#aaa', marginTop: 12 },

    // Stats
    statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    statBox: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: 'bold', color: '#6200ee' },
    statLabel: { fontSize: 11, color: '#999', marginTop: 2 },

    // List
    list: { padding: 15, paddingBottom: 30 },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 20, padding: 20,
        marginBottom: 14,
        elevation: 3,
        shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    orderDate: { fontSize: 12, color: '#999', marginTop: 3 },
    orderAmount: { fontSize: 22, fontWeight: '900', color: '#6200ee' },

    // Status
    statusWrap: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 14 },
    statusText: { fontWeight: 'bold', fontSize: 13 },

    // Timeline
    timeline: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    timelineStep: { alignItems: 'center', flex: 1 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd', marginBottom: 4 },
    timelineDotDone: { backgroundColor: '#6200ee' },
    timelineLabel: { fontSize: 9, color: '#bbb' },
    timelineLabelDone: { color: '#6200ee', fontWeight: 'bold' },

    itemsText: { fontSize: 12, color: '#999', marginBottom: 10 },

    actionButtons: { marginTop: 8 },
    cancelBtn: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
    cancelBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
    reviewBtn: { backgroundColor: '#fff3e0', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' },
    reviewBtnText: { color: '#f59e0b', fontWeight: 'bold', fontSize: 14 },

    // Empty
    emptyBox: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    emptyText: { color: '#999', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
    shopNowBtn: { backgroundColor: '#6200ee', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
    shopNowText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export default OrderHistoryScreen;

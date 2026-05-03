import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import api from '../services/api';

const BASE_URL = 'http://10.73.229.142:3000';

const CheckoutScreen = ({ navigate, selectedProduct, cart = [], removeFromCart, clearCart }) => {
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCode, setAppliedCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [loading, setLoading] = useState(false);
    
    // Delivery Details
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    // Card Details
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    // Build the final list of items to checkout
    const allItems = [...cart];
    if (selectedProduct && !cart.find(c => c._id === selectedProduct._id)) {
        allItems.push({ ...selectedProduct, cartId: 'direct_buy', isCustomized: true });
    }

    const subtotal = allItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    const discountAmount = subtotal * (discount / 100);
    const finalTotal = subtotal - discountAmount;

    // ─── Apply Promo ─────────────────────
    const handleApplyPromo = async () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) return Alert.alert('Error', 'Please enter a promo code.');
        
        setLoading(true);
        try {
            const res = await api.get(`/promos/validate/${code}?subtotal=${subtotal}`);
            setDiscount(res.data.discountPercentage);
            setAppliedCode(code);
            Alert.alert('🎉 Promo Applied!', `${res.data.discountPercentage}% discount applied successfully!`);
        } catch (error) {
            const msg = error.response?.data?.message || 'Promo code is invalid or expired.';
            Alert.alert('❌ Invalid Code', msg);
            setDiscount(0);
            setAppliedCode('');
        } finally {
            setLoading(false);
        }
    };

    // Remove applied promo code
    const handleRemovePromo = () => {
        setDiscount(0);
        setAppliedCode('');
        setPromoCode('');
        Alert.alert('Promo Removed', 'Promo code has been removed from your order.');
    };

    // ─── Phone Number Validation & Formatting ─────────────────────
    const formatPhoneNumber = (phoneNumber) => {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Format based on length and country code
        if (cleaned.startsWith('94') && cleaned.length === 11) {
            // Sri Lanka format: 94 + 9 digits
            return `+94 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        } else if (cleaned.startsWith('1') && cleaned.length === 11) {
            // US format: 1 + 10 digits
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.startsWith('44') && cleaned.length === 11) {
            // UK format: 44 + 10 digits
            return `+44 ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
        } else if (cleaned.length === 10) {
            // Local 10-digit format
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        
        // Return as-is if no specific format matches
        return phoneNumber;
    };

    const validatePhoneNumber = (phoneNumber) => {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Check if it's a valid phone number (10-15 digits)
        if (cleaned.length < 10 || cleaned.length > 15) {
            return false;
        }
        
        // Check if it starts with valid country code or local format
        const validPatterns = [
            /^\d{10}$/, // 10-digit local numbers
            /^\d{11}$/, // 11-digit numbers with country code
            /^\d{12}$/, // 12-digit numbers
            /^\d{13}$/, // 13-digit numbers
            /^\d{14}$/, // 14-digit numbers
            /^\d{15}$/, // 15-digit numbers
            /^94\d{9}$/, // Sri Lanka format (94 + 9 digits)
            /^1\d{10}$/, // US format (1 + 10 digits)
            /^44\d{10}$/, // UK format (44 + 10 digits)
        ];
        
        return validPatterns.some(pattern => pattern.test(cleaned));
    };

    // Handle phone number input with formatting
    const handlePhoneChange = (text) => {
        // Allow only digits, +, and basic formatting
        const cleaned = text.replace(/[^\d+]/g, '');
        setPhone(cleaned);
    };

    // ─── Place Order ─────────────────────
    const handlePlaceOrder = async () => {
        if (!global.userToken || global.userRole === 'guest') {
            return Alert.alert('Login Required', 'Please login or register to place an order.');
        }
        if (allItems.length === 0) {
            return Alert.alert('Empty Cart', 'Add at least one item before ordering.');
        }
        if (!address || !city || !phone) {
            return Alert.alert('Missing Details', 'Please fill in all delivery details.');
        }
        
        // Phone number validation
        if (!validatePhoneNumber(phone)) {
            return Alert.alert('Invalid Phone Number', 'Please enter a valid phone number (10-15 digits). Examples: 0712345678, +94712345678, or 94712345678');
        }
        
        if (paymentMethod === 'Card Payment' && (!cardNumber || !expiry || !cvv)) {
            return Alert.alert('Missing Details', 'Please fill in your card details.');
        }

        setLoading(true);

        // Fake payment verification delay
        if (paymentMethod === 'Card Payment') {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
            const products = allItems.map(item => ({
                product: item._id,
                quantity: 1
            }));

            await api.post('/orders', {
                products,
                totalAmount: finalTotal,
                paymentMethod,
                deliveryDetails: { address, city, phone }
            });

            if (clearCart) clearCart();

            Alert.alert(
                '✅ Order Placed!', 
                `Your order of $${finalTotal.toFixed(2)} has been placed successfully!\nIt will be delivered to ${address}, ${city}.`, 
                [
                    { text: 'Track My Orders', onPress: () => navigate('Orders') },
                    { text: 'Continue Shopping', onPress: () => navigate('Products') }
                ]
            );
        } catch (error) {
            Alert.alert('❌ Checkout Failed', error.response?.data?.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Cart Items */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>🛒 Order Summary ({allItems.length} items)</Text>
                {allItems.length === 0 ? (
                    <Text style={styles.emptyText}>Your cart is empty. Go add some gifts! 🎁</Text>
                ) : (
                    allItems.map((item, idx) => (
                        <View key={item.cartId || idx} style={styles.itemRow}>
                            {item.imageUrl ? (
                                <Image source={{ uri: `${BASE_URL}${item.imageUrl}` }}
                                    style={styles.itemThumb} onError={() => {}} />
                            ) : (
                                <View style={[styles.itemThumb, styles.thumbFallback]}>
                                    <Text style={{ fontSize: 20 }}>🎁</Text>
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemCategory}>{item.category || 'Gift'}</Text>
                                <Text style={styles.itemPrice}>${(parseFloat(item.price) || 0).toFixed(2)}</Text>
                            </View>
                            {removeFromCart && (
                                <TouchableOpacity onPress={() => removeFromCart(item.cartId)}
                                    style={styles.removeBtn}>
                                    <Text style={styles.removeBtnText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}

                {/* Totals */}
                {allItems.length > 0 && (
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                        </View>
                        {discount > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: '#2e7d32' }]}>
                                    Discount ({appliedCode})
                                </Text>
                                <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                    -${discountAmount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                        <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' }]}>
                            <Text style={[styles.totalLabel, { fontSize: 18 }]}>Total</Text>
                            <Text style={[styles.totalValue, { fontSize: 22, color: '#6200ee' }]}>
                                ${finalTotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Delivery Details */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📍 Delivery Details</Text>
                <TextInput style={styles.inputField} placeholder="Street Address" value={address} onChangeText={setAddress} />
                <View style={{flexDirection: 'row', gap: 10}}>
                    <TextInput style={[styles.inputField, {flex: 1}]} placeholder="City" value={city} onChangeText={setCity} />
                    <TextInput 
                        style={[styles.inputField, {flex: 1}, phone && !validatePhoneNumber(phone) && styles.inputError]} 
                        placeholder="Phone Number" 
                        keyboardType="phone-pad" 
                        value={phone} 
                        onChangeText={handlePhoneChange}
                        maxLength={15}
                    />
                </View>
                {phone && !validatePhoneNumber(phone) && (
                    <Text style={styles.errorText}>Please enter a valid phone number</Text>
                )}
            </View>

            {/* Promo Code */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>🎟️ Promo Code</Text>
                {appliedCode ? (
                    <View style={styles.appliedBadge}>
                        <Text style={styles.appliedText}>✅ "{appliedCode}" applied — {discount}% OFF!</Text>
                        <TouchableOpacity style={styles.removeBtn} onPress={handleRemovePromo}>
                            <Text style={styles.removeBtnText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.promoRow}>
                        <TextInput
                            style={styles.promoInput}
                            placeholder="Enter code"
                            value={promoCode}
                            onChangeText={t => setPromoCode(t.toUpperCase())}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            style={[styles.applyBtn, { opacity: promoCode ? 1 : 0.4 }]}
                            onPress={() => handleApplyPromo()}
                            disabled={!promoCode}>
                            <Text style={styles.applyBtnText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Payment Method */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>💳 Payment Method</Text>
                {['Cash on Delivery', 'Card Payment'].map(m => (
                    <TouchableOpacity key={m} style={styles.payOption} onPress={() => setPaymentMethod(m)} activeOpacity={0.8}>
                        <View style={[styles.radio, paymentMethod === m && styles.radioActive]} />
                        <Text style={styles.payText}>{m === 'Card Payment' ? 'Credit / Debit Card' : 'Cash on Delivery'}</Text>
                        {m === 'Card Payment' && <Text style={{marginLeft: 'auto', fontSize: 20}}>💳</Text>}
                    </TouchableOpacity>
                ))}

                {/* Card Fields expand if Card Payment selected */}
                {paymentMethod === 'Card Payment' && (
                    <View style={styles.cardDetailsBox}>
                        <TextInput style={styles.inputField} placeholder="Card Number (16 digits)" keyboardType="numeric" maxLength={16} value={cardNumber} onChangeText={setCardNumber} />
                        <View style={{flexDirection: 'row', gap: 10}}>
                            <TextInput style={[styles.inputField, {flex: 1}]} placeholder="MM/YY" maxLength={5} value={expiry} onChangeText={setExpiry} />
                            <TextInput style={[styles.inputField, {flex: 1}]} placeholder="CVV" keyboardType="numeric" maxLength={4} secureTextEntry value={cvv} onChangeText={setCvv} />
                        </View>
                        <Text style={{color: '#999', fontSize: 11, textAlign: 'center', marginTop: 5}}>🔒 Payments are securely verified</Text>
                    </View>
                )}
            </View>

            {/* Place Order */}
            <TouchableOpacity
                style={[styles.placeOrderBtn, (loading || allItems.length === 0) && { opacity: 0.6 }]}
                onPress={handlePlaceOrder}
                disabled={loading || allItems.length === 0}
                activeOpacity={0.8}>
                {loading ? (
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator color="#000" style={{marginRight: 10}} />
                        <Text style={styles.placeOrderText}>{paymentMethod === 'Card Payment' ? 'Verifying Card...' : 'Processing...'}</Text>
                    </View>
                ) : (
                    <Text style={styles.placeOrderText}>
                        {paymentMethod === 'Card Payment' ? `💳 Pay $${finalTotal.toFixed(2)} securely` : `🛒 Confirm Order — $${finalTotal.toFixed(2)}`}
                    </Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8', padding: 15 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#6200ee' },

    // Inputs
    inputField: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#e0e0e0', padding: 14, borderRadius: 12, marginBottom: 10, fontSize: 14 },
    inputError: { borderColor: '#f44336', backgroundColor: '#ffebee' },
    errorText: { color: '#f44336', fontSize: 12, marginTop: 4 },
    helperText: { color: '#666', fontSize: 11, marginTop: 4, fontStyle: 'italic' },

    // Items
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemThumb: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#f0f0f0' },
    thumbFallback: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3e5f5' },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#222' },
    itemCategory: { fontSize: 11, color: '#999', marginTop: 2 },
    itemPrice: { fontSize: 14, color: '#6200ee', fontWeight: 'bold', marginTop: 4 },
    removeBtn: { padding: 8, backgroundColor: '#fce4ec', borderRadius: 20 },
    removeBtnText: { color: '#c62828', fontWeight: 'bold', fontSize: 12 },
    emptyText: { color: '#999', textAlign: 'center', paddingVertical: 20 },

    // Totals
    totalsBox: { marginTop: 10, paddingTop: 10 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    totalLabel: { fontSize: 15, color: '#555', fontWeight: '600' },
    totalValue: { fontSize: 16, color: '#333', fontWeight: 'bold' },

    // Promo
    appliedBadge: { backgroundColor: '#e8f5e9', padding: 14, borderRadius: 10, alignItems: 'center' },
    appliedText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
    removeBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#e8f5e9', marginTop: 8 },
    removeBtnText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 12 },
    promoRow: { flexDirection: 'row', alignItems: 'center' },
    promoInput: { flex: 1, backgroundColor: '#f5f5f5', padding: 13, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15, letterSpacing: 1 },
    applyBtn: { backgroundColor: '#6200ee', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 10, marginLeft: 10, height: 48 },
    applyBtnText: { color: '#fff', fontWeight: 'bold' },

    // Payment Options 
    payOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingVertical: 5 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#6200ee', marginRight: 14 },
    radioActive: { backgroundColor: '#6200ee', borderColor: '#6200ee', borderWidth: 6 },
    payText: { fontSize: 15, color: '#333', fontWeight: '600' },
    cardDetailsBox: { backgroundColor: '#f5f5fa', padding: 15, borderRadius: 12, marginTop: -5, borderWidth: 1, borderColor: '#eaebf2' },

    // Place Order
    placeOrderBtn: { backgroundColor: '#03dac6', padding: 18, borderRadius: 16, marginTop: 5, shadowColor: '#03dac6', shadowRadius: 10, shadowOpacity: 0.4, elevation: 5 },
    placeOrderText: { textAlign: 'center', fontWeight: 'bold', fontSize: 17, color: '#000' },
});

export default CheckoutScreen;

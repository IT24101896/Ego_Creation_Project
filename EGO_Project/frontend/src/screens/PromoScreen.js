import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import api from '../services/api';

const PromoScreen = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { valid: true/false, discount, message }

    const handleValidate = async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return Alert.alert('EGO', 'Please enter a promo code.');
        setLoading(true);
        setResult(null);
        try {
            const res = await api.get(`/promos/validate/${trimmed}`);
            setResult({ valid: true, discount: res.data.discountPercentage, expiry: res.data.expiryDate, code: trimmed });
        } catch (error) {
            const msg = error.response?.data?.message || 'Code is invalid or expired.';
            setResult({ valid: false, message: msg });
        } finally {
            setLoading(false);
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
                    <Text style={styles.heroIcon}>🎟️</Text>
                    <Text style={styles.heroTitle}>Promo Codes</Text>
                    <Text style={styles.heroSub}>Enter your code to unlock exclusive discounts</Text>
                </View>

                {/* Input Card */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Your Promo Code</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. SUMMER20"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={code}
                            onChangeText={t => { setCode(t.toUpperCase()); setResult(null); }}
                            autoCapitalize="characters"
                            maxLength={20}
                        />
                        <TouchableOpacity
                            style={[styles.applyBtn, (!code || loading) && { opacity: 0.5 }]}
                            onPress={handleValidate}
                            disabled={!code || loading}
                            activeOpacity={0.8}>
                            {loading
                                ? <ActivityIndicator color="#000" size="small" />
                                : <Text style={styles.applyBtnText}>Check</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Result */}
                    {result && (
                        result.valid ? (
                            <View style={styles.successBox}>
                                <Text style={styles.successIcon}>🎉</Text>
                                <Text style={styles.successTitle}>{result.discount}% OFF Unlocked!</Text>
                                <Text style={styles.successCode}>Code: {result.code}</Text>
                                <Text style={styles.successExpiry}>
                                    Expires: {new Date(result.expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                                <Text style={styles.successCta}>Apply this code at checkout 🛒</Text>
                            </View>
                        ) : (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorIcon}>❌</Text>
                                <Text style={styles.errorTitle}>Code Not Valid</Text>
                                <Text style={styles.errorMsg}>{result.message}</Text>
                            </View>
                        )
                    )}
                </View>

                {/* How It Works */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>💡 How It Works</Text>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                        <Text style={styles.stepText}>Enter your promo code above and tap "Check"</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                        <Text style={styles.stepText}>If valid, the discount will be shown</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                        <Text style={styles.stepText}>Enter the same code in Checkout to save!</Text>
                    </View>
                </View>

                {/* Perks */}
                <View style={styles.perksRow}>
                    {[
                        { icon: '🚀', label: 'Instant\nDiscount' },
                        { icon: '🔒', label: 'Secure\nCheckout' },
                        { icon: '⏰', label: '30 Day\nValidity' },
                    ].map(p => (
                        <View key={p.label} style={styles.perkBox}>
                            <Text style={styles.perkIcon}>{p.icon}</Text>
                            <Text style={styles.perkLabel}>{p.label}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    orb1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(98,0,238,0.2)', top: -60, right: -60 },
    orb2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(3,218,198,0.12)', bottom: 100, left: -50 },

    content: { padding: 20, paddingTop: 10 },

    // Hero
    hero: { alignItems: 'center', paddingVertical: 30 },
    heroIcon: { fontSize: 56, marginBottom: 12 },
    heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    heroSub: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center' },

    // Card
    card: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 22,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16
    },
    cardLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: 0.5 },
    inputRow: { flexDirection: 'row', gap: 10 },
    input: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#fff', borderRadius: 14, paddingHorizontal: 18,
        paddingVertical: 15, fontSize: 18, fontWeight: 'bold',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        letterSpacing: 2
    },
    applyBtn: {
        backgroundColor: '#03dac6', borderRadius: 14,
        paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#03dac6', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6
    },
    applyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

    // Success
    successBox: { marginTop: 16, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
    successIcon: { fontSize: 36, marginBottom: 8 },
    successTitle: { fontSize: 22, fontWeight: 'bold', color: '#10b981', marginBottom: 6 },
    successCode: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 2 },
    successExpiry: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 },
    successCta: { color: '#03dac6', fontWeight: 'bold', fontSize: 14 },

    // Error
    errorBox: { marginTop: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    errorIcon: { fontSize: 32, marginBottom: 8 },
    errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#ef4444', marginBottom: 6 },
    errorMsg: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' },

    // Info Card
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 16
    },
    infoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 16 },
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6200ee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    stepNumText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    stepText: { color: 'rgba(255,255,255,0.55)', fontSize: 14, flex: 1 },

    // Perks
    perksRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    perkBox: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16, paddingVertical: 18, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
    },
    perkIcon: { fontSize: 28, marginBottom: 8 },
    perkLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});

export default PromoScreen;

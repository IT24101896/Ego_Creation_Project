import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView, Alert, StatusBar, ScrollView } from 'react-native';
import { register } from '../services/api';

const Field = ({ icon, placeholder, value, onChange, secure, keyboard, onFocus, onBlur, isFocused }) => (
    <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={value}
            onChangeText={onChange}
            secureTextEntry={secure}
            keyboardType={keyboard || 'default'}
            autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    </View>
);

const RegisterScreen = ({ navigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirm) return Alert.alert('EGO', 'Please fill in all fields.');
        if (password !== confirm) return Alert.alert('EGO', 'Passwords do not match.');
        if (password.length < 6) return Alert.alert('EGO', 'Password must be at least 6 characters.');

        setLoading(true);
        try {
            await register({ name, email, password });
            Alert.alert('🎉 Account Created!', 'Welcome to EGO! Please sign in.', [
                { text: 'Sign In', onPress: () => navigate('Login') }
            ]);
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Email might already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>EGO</Text>
                    </View>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSub}>Join the EGO premium community</Text>
                </View>

                {/* Glass Card */}
                <View style={styles.glassCard}>
                    <Field 
                        icon="👤" placeholder="Full Name" value={name} onChange={setName} 
                        isFocused={focusedField === 'name'} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} 
                    />
                    <Field 
                        icon="✉️" placeholder="Email Address" value={email} onChange={setEmail} keyboard="email-address" 
                        isFocused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} 
                    />
                    <Field 
                        icon="🔒" placeholder="Password (min. 6 chars)" value={password} onChange={setPassword} secure 
                        isFocused={focusedField === 'pass'} onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)} 
                    />
                    <Field 
                        icon="🔑" placeholder="Confirm Password" value={confirm} onChange={setConfirm} secure 
                        isFocused={focusedField === 'confirm'} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} 
                    />

                    <TouchableOpacity
                        style={[styles.signUpBtn, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}>
                        <Text style={styles.signUpText}>{loading ? 'Creating Account...' : '✨  Create Account'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.loginLink} onPress={() => navigate('Login')}>
                    <Text style={styles.loginLinkText}>
                        Already a member? <Text style={{ color: '#03dac6', fontWeight: 'bold' }}>Sign In →</Text>
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(98,0,238,0.2)', top: -60, right: -80 },
    orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(3,218,198,0.12)', bottom: 50, left: -60 },

    content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },

    header: { alignItems: 'center', marginBottom: 30 },
    logoCircle: {
        width: 75, height: 75, borderRadius: 38,
        backgroundColor: 'rgba(98,0,238,0.55)',
        borderWidth: 2, borderColor: 'rgba(3,218,198,0.7)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
        shadowColor: '#6200ee', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 10
    },
    logoText: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 3 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },

    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 28, padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20
    },

    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 14, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 14, paddingVertical: 2
    },
    inputWrapFocused: { borderColor: 'rgba(3,218,198,0.65)', backgroundColor: 'rgba(3,218,198,0.05)' },
    inputIcon: { fontSize: 15, marginRight: 10 },
    input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },

    signUpBtn: {
        backgroundColor: '#03dac6', paddingVertical: 17,
        borderRadius: 14, marginTop: 8,
        shadowColor: '#03dac6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8
    },
    signUpText: { color: '#000', textAlign: 'center', fontWeight: 'bold', fontSize: 17 },

    loginLink: { alignItems: 'center', paddingVertical: 8 },
    loginLinkText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
});

export default RegisterScreen;
